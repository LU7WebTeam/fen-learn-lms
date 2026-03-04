<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class ForceHttpsOnReplit
{
    public function handle(Request $request, Closure $next): Response
    {
        // config() works after config:cache; env() returns null when cache is active.
        if ($root = config('app.asset_url')) {
            // Tell the URL generator to always produce https:// URLs with the
            // public Replit domain, regardless of the HTTP scheme the internal
            // PHP server sees from the Replit proxy.
            URL::forceScheme('https');
            URL::forceRootUrl($root);
        }

        return $next($request);
    }
}
