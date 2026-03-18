<?php

namespace App\Support;

use App\Mail\TwoFactorCodeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TwoFactorAuthenticator
{
    /**
     * Generate and send a 2FA code to the user's email.
     * The code is valid for 10 minutes.
     */
    public static function sendCode(User $user): void
    {
        // Generate a 6-digit numeric code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store the code and set expiration (10 minutes)
        $user->update([
            'two_factor_code' => $code,
            'two_factor_code_expires_at' => now()->addMinutes(10),
        ]);

        // Send the code via email
        Mail::send(new TwoFactorCodeMail($user, $code));

        // Log the event
        SystemLogger::write('info', '2FA code sent', [
            'auth_flow' => '2fa_code_sent',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Verify the provided code against the user's stored code.
     * Returns true if the code is correct and not expired.
     */
    public static function verifyCode(User $user, string $code): bool
    {
        // Check if code matches and hasn't expired
        if (
            !$user->two_factor_code ||
            $user->two_factor_code !== $code ||
            !$user->two_factor_code_expires_at ||
            now()->isAfter($user->two_factor_code_expires_at)
        ) {
            SystemLogger::write('warning', '2FA verification failed', [
                'auth_flow' => '2fa_verification_failed',
                'user_id' => $user->id,
                'reason' => $user->two_factor_code ? 'invalid_or_expired' : 'no_code',
            ]);
            return false;
        }

        // Clear the code after successful verification
        $user->update([
            'two_factor_code' => null,
            'two_factor_code_expires_at' => null,
        ]);

        SystemLogger::write('info', '2FA verification success', [
            'auth_flow' => '2fa_verification_success',
            'user_id' => $user->id,
        ]);

        return true;
    }

    /**
     * Clear any pending 2FA codes for a user.
     */
    public static function clearCode(User $user): void
    {
        $user->update([
            'two_factor_code' => null,
            'two_factor_code_expires_at' => null,
        ]);
    }
}
