<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\CaptchaVerifier;
use App\Support\SystemLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        CaptchaVerifier::enforce($request, 'forgot_password');

        $request->validate([
            'email' => 'required|email',
        ]);

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            SystemLogger::write('info', 'Password reset link requested', [
                'auth_flow' => 'forgot_password',
                'email_hash' => hash('sha256', strtolower(trim((string) $request->input('email', '')))),
            ], $request);

            return back()->with('status', __($status));
        }

        SystemLogger::write('warning', 'Password reset link request failed', [
            'auth_flow' => 'forgot_password',
            'reset_status' => $status,
        ], $request);

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
