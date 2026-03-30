<?php

namespace App\Support;

use App\Models\User;

class UserHomeRoute
{
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