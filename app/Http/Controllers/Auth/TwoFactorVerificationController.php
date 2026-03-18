<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class TwoFactorVerificationController extends Controller
{
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

        // Verify the code
        if (!TwoFactorAuthenticator::verifyCode($user, $request->input('code'))) {
            return back()->withErrors(['code' => 'Invalid or expired verification code.']);
        }

        // Complete the login
        Auth::login($user, session('2fa_remember', false));
        $request->session()->regenerate();

        // Clear 2FA session data
        session()->forget(['2fa_user_id', '2fa_email', '2fa_remember']);

        $defaultRoute = $user->isAdmin() ? 'admin.dashboard' : 'dashboard';

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

        // Send a new code
        TwoFactorAuthenticator::sendCode($user);

        return back()->with('success', 'Verification code resent to your email.');
    }
}
