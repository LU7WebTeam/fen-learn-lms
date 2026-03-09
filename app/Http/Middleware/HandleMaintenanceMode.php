<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleMaintenanceMode
{
    private array $bypassPrefixes = [
        '/admin',
        '/login',
        '/logout',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/email',
        '/confirm-password',
        '/password',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldBypass($request)) {
            return $next($request);
        }

        try {
            $maintenance = Setting::get('maintenance_mode', '0');
        } catch (\Throwable) {
            return $next($request);
        }

        if ($maintenance === '1') {
            $message = Setting::get(
                'maintenance_message',
                'We are currently down for scheduled maintenance. Please check back soon.'
            );

            return response()->view('maintenance', ['message' => $message], 503);
        }

        return $next($request);
    }

    private function shouldBypass(Request $request): bool
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            return true;
        }

        $path = '/' . ltrim($request->path(), '/');
        foreach ($this->bypassPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }
}
