<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isSuspended()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            $message = in_array(app()->getLocale(), ['ms', 'bm'], true)
                ? 'Akaun anda telah digantung. Sila hubungi admin untuk bantuan.'
                : 'Your account has been suspended. Please contact admin for assistance.';

            return redirect()->route('login')
                ->withErrors(['email' => $message]);
        }

        return $next($request);
    }
}
