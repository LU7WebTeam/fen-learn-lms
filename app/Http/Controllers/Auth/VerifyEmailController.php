<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\UserHomeRoute;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    /**
     * Mark the target user's email address as verified via signed URL.
     */
    public function __invoke(Request $request): RedirectResponse
    {
        $user = User::query()->findOrFail((int) $request->route('id'));
        $expectedHash = sha1($user->getEmailForVerification());
        $actualHash = (string) $request->route('hash');

        abort_unless(hash_equals($expectedHash, $actualHash), 403);

        $wasJustVerified = false;

        if (! $user->hasVerifiedEmail() && $user->markEmailAsVerified()) {
            event(new Verified($user));
            $wasJustVerified = true;
        }

        if ($request->user()?->is($user)) {
            $defaultUrl = UserHomeRoute::postRegistrationUrlFor($request->user(), false).'?verified=1';

            return redirect()->intended($defaultUrl);
        }

        return redirect()
            ->route('login')
            ->with('status', $wasJustVerified
                ? 'Your email has been verified. You can now log in.'
                : 'Your email is already verified. Please log in.');
    }
}
