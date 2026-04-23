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
            // Match generated URL scheme to configured root URL so local HTTP
            // and deployed HTTPS environments both behave correctly.
            $scheme = parse_url($root, PHP_URL_SCHEME) ?: 'https';

            URL::forceScheme($scheme);
            URL::forceRootUrl($root);
        }

        return $next($request);
    }
}
