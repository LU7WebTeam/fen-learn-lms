<?php

namespace App\Support;

use App\Models\User;

class UserHomeRoute
{
    public static function postRegistrationUrlFor(User $user, bool $absolute = false): string
    {
        if ($user->isAdmin()) {
            return route('admin.dashboard', absolute: $absolute);
        }

        if (!$user->profile_completed_at) {
            return route('profile.setup', absolute: $absolute);
        }

        return route('courses.show', ['course' => 'fen-proaktif'], $absolute);
    }

    public static function nameFor(User $user): string
    {
        if ($user->isAdmin()) {
            return 'admin.dashboard';
        }

        if (!$user->profile_completed_at) {
            return 'profile.setup';
        }

        return $user->enrollments()->exists() ? 'dashboard' : 'courses.index';
    }
}