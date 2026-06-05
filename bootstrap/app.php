<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust Replit's TLS-terminating proxy so $request->url() reads https://
        // and signed-URL verification (email verify, password reset) succeeds.
        $middleware->trustProxies(
            at: '*',
            headers: Request::HEADER_X_FORWARDED_FOR |
                     Request::HEADER_X_FORWARDED_HOST |
                     Request::HEADER_X_FORWARDED_PORT |
                     Request::HEADER_X_FORWARDED_PROTO,
        );

        $middleware->prepend(\App\Http\Middleware\ForceHttpsOnReplit::class);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\HandleMaintenanceMode::class,
            \App\Http\Middleware\EnsureNotSuspended::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'admin'            => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'admin.course-scope' => \App\Http\Middleware\EnsureCourseViewerScope::class,
            'profile.complete' => \App\Http\Middleware\EnsureProfileIsComplete::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
