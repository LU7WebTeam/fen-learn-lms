<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\TwoFactorAuthenticator;
use App\Support\UserHomeRoute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorVerificationController extends Controller
{
    private const VERIFY_MAX_ATTEMPTS = 5;
    private const VERIFY_DECAY_SECONDS = 300;
    private const RESEND_MAX_ATTEMPTS = 3;
    private const RESEND_DECAY_SECONDS = 600;
    private const RESEND_COOLDOWN_SECONDS = 60;

    /**
     * Display the 2FA verification form.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $userId = session('2fa_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorVerification', [
            'email' => session('2fa_email'),
        ]);
    }

    /**
     * Verify the 2FA code and complete login.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|digits:6',
        ]);

        $userId = session('2fa_user_id');
        $userEmail = session('2fa_email');

        if (!$userId || !$userEmail) {
            return redirect()->route('login')->with('error', '2FA session expired. Please log in again.');
        }

        // Find the user
        $user = \App\Models\User::find($userId);

        if (!$user || $user->email !== $userEmail) {
            return back()->withErrors(['code' => 'Invalid session.']);
        }

        $verifyKey = $this->verifyThrottleKey($request, $user->id);

        if (RateLimiter::tooManyAttempts($verifyKey, self::VERIFY_MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($verifyKey);

            return back()->withErrors([
                'code' => "Too many verification attempts. Please wait {$seconds} seconds and try again.",
            ]);
        }

        // Verify the code
        if (!TwoFactorAuthenticator::verifyCode($user, $request->input('code'))) {
            RateLimiter::hit($verifyKey, self::VERIFY_DECAY_SECONDS);

            return back()->withErrors(['code' => 'Invalid or expired verification code.']);
        }

        RateLimiter::clear($verifyKey);

        // Complete the login
        Auth::login($user, session('2fa_remember', false));
        $request->session()->regenerate();

        // Clear 2FA session data
        session()->forget(['2fa_user_id', '2fa_email', '2fa_remember']);

        $defaultRoute = UserHomeRoute::nameFor($user);

        return redirect()->intended(route($defaultRoute, absolute: false));
    }

    /**
     * Resend the verification code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $userId = session('2fa_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = \App\Models\User::find($userId);

        if (!$user) {
            return redirect()->route('login');
        }

        $resendKey = $this->resendThrottleKey($request, $user->id);
        if (RateLimiter::tooManyAttempts($resendKey, self::RESEND_MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($resendKey);

            return back()->with('error', "Too many resend requests. Please wait {$seconds} seconds and try again.");
        }

        $cooldownKey = $this->resendCooldownKey($request, $user->id);
        if (RateLimiter::tooManyAttempts($cooldownKey, 1)) {
            $seconds = RateLimiter::availableIn($cooldownKey);

            return back()->with('error', "Please wait {$seconds} seconds before requesting a new code.");
        }

        RateLimiter::hit($resendKey, self::RESEND_DECAY_SECONDS);
        RateLimiter::hit($cooldownKey, self::RESEND_COOLDOWN_SECONDS);

        try {
            // Send a new code
            TwoFactorAuthenticator::sendCode($user);
        } catch (\Throwable) {
            return back()->with('error', 'Unable to resend verification code right now. Please try again later.');
        }

        return back()->with('success', 'Verification code resent to your email.');
    }

    private function verifyThrottleKey(Request $request, int $userId): string
    {
        return "2fa:verify:{$userId}|{$request->ip()}";
    }

    private function resendThrottleKey(Request $request, int $userId): string
    {
        return "2fa:resend:{$userId}|{$request->ip()}";
    }

    private function resendCooldownKey(Request $request, int $userId): string
    {
        return "2fa:resend-cooldown:{$userId}|{$request->ip()}";
    }
}
