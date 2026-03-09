<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    private array $bypassRoutes = [
        'profile.setup',
        'profile.setup.store',
        'profile.edit',
        'profile.update',
        'profile.destroy',
        'logout',
        'verification.notice',
        'verification.verify',
        'verification.send',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($request->routeIs(...$this->bypassRoutes)) {
            return $next($request);
        }

        if (!$user->profile_completed_at) {
            return redirect()->route('profile.setup');
        }

        return $next($request);
    }
}
