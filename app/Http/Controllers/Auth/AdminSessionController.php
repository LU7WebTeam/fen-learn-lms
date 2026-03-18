<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Support\TwoFactorAuthenticator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AdminSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/AdminLogin', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        // Verify credentials without logging in (for 2FA)
        $user = $request->verifyCredentialsFor2FA();

        // Check if user is admin
        if (!in_array($user->role, ['super_admin', 'content_editor'])) {
            return back()->withErrors([
                'email' => 'This login is for administrators only. Please use the learner login.',
            ]);
        }

        // Generate and send 2FA code
        TwoFactorAuthenticator::sendCode($user);

        // Store user info in session for 2FA verification
        $request->session()->put([
            '2fa_user_id' => $user->id,
            '2fa_email' => $user->email,
            '2fa_remember' => $request->boolean('remember'),
            '2fa_is_admin' => true,
        ]);

        return redirect()->route('two-factor.verify');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
