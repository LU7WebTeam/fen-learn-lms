<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\CaptchaVerifier;
use App\Support\SystemLogger;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        CaptchaVerifier::enforce($request, 'login');

        // Verify credentials without logging in (for 2FA)
        $user = $request->verifyCredentialsFor2FA();

        // Skip 2FA when disabled (e.g. local dev without SMTP)
        if (!config('auth.two_factor_enabled')) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        try {
            // Generate and send 2FA code
            TwoFactorAuthenticator::sendCode($user);
        } catch (\Throwable) {
            return back()->withErrors([
                'email' => 'Unable to send verification code email right now. Please try again later or contact support.',
            ]);
        }

        // Store user info in session for 2FA verification
        $request->session()->put([
            '2fa_user_id' => $user->id,
            '2fa_email' => $user->email,
            '2fa_remember' => $request->boolean('remember'),
        ]);

        SystemLogger::write('info', 'Learner 2FA code sent', [
            'auth_flow' => '2fa_code_sent',
        ], $request);

        return redirect()->route('two-factor.verify');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        SystemLogger::write('info', 'Learner logout', [
            'auth_flow' => 'logout',
        ], $request);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
