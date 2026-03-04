<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // When running on Replit, the proxy forwards requests as HTTP internally
        // but the public URL is HTTPS. Force HTTPS so asset URLs are browser-accessible.
        if (env('REPLIT_DEV_DOMAIN')) {
            URL::forceScheme('https');
            URL::forceRootUrl('https://' . env('REPLIT_DEV_DOMAIN'));
        }
    }
}
