<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCourseViewerScope
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isCourseViewer()) {
            return $next($request);
        }

        $routeName = (string) ($request->route()?->getName() ?? '');

        $allowed = in_array($routeName, [
            'admin.dashboard',
            'admin.courses.index',
            'admin.courses.edit',
            'admin.lessons.edit',
        ], true);

        if (!$allowed) {
            abort(403, 'Your role only has read-only access to permitted courses.');
        }

        return $next($request);
    }
}
