<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleMaintenanceMode
{
    private array $maintenanceBypassPrefixes = [
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

    private array $siteLockBypassPrefixes = [
        '/admin',
        '/site-lock',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldBypassForAdmin($request)) {
            return $next($request);
        }

        try {
            $siteLockEnabled = Setting::get('site_lock_enabled', '0');
            $maintenance = Setting::get('maintenance_mode', '0');
        } catch (\Throwable) {
            return $next($request);
        }

        if ($siteLockEnabled === '1' && !$this->shouldBypassSiteLock($request) && !$this->hasValidSiteLockSession($request)) {
            return redirect()->route('site-lock.show');
        }

        if ($maintenance === '1' && !$this->shouldBypassMaintenance($request)) {
            $message = Setting::get(
                'maintenance_message',
                'We are currently down for scheduled maintenance. Please check back soon.'
            );

            return response()->view('maintenance', ['message' => $message], 503);
        }

        return $next($request);
    }

    private function shouldBypassForAdmin(Request $request): bool
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            return true;
        }

        return false;
    }

    private function shouldBypassMaintenance(Request $request): bool
    {
        $path = '/' . ltrim($request->path(), '/');
        foreach ($this->maintenanceBypassPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }

    private function shouldBypassSiteLock(Request $request): bool
    {
        $path = '/' . ltrim($request->path(), '/');
        foreach ($this->siteLockBypassPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }

        return false;
    }

    private function hasValidSiteLockSession(Request $request): bool
    {
        if (!$request->session()->get('site_lock_unlocked', false)) {
            return false;
        }

        $sessionHash = (string) $request->session()->get('site_lock_password_hash', '');
        $currentHash = (string) Setting::get('site_lock_password_hash', '');

        return $sessionHash !== '' && hash_equals($sessionHash, $currentHash);
    }

}
