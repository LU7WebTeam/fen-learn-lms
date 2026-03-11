<?php

namespace App\Providers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
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
        // Shared-host MySQL/MariaDB variants may still enforce 1000-byte key limits.
        Schema::defaultStringLength(191);

        Vite::prefetch(concurrency: 3);

        if ($root = config('app.asset_url')) {
            URL::forceScheme('https');
            URL::forceRootUrl($root);
        }

        $this->applySmtpFromSettings();
    }

    private function applySmtpFromSettings(): void
    {
        try {
            $driver   = \App\Models\Setting::get('mail_driver');
            $host     = \App\Models\Setting::get('mail_host');
            $port     = \App\Models\Setting::get('mail_port');
            $scheme   = \App\Models\Setting::get('mail_scheme');
            $username = \App\Models\Setting::get('mail_username');
            $password = \App\Models\Setting::get('mail_password');
            $name     = \App\Models\Setting::get('mail_sender_name');
            $address  = \App\Models\Setting::get('mail_sender_address');

            if ($driver) Config::set('mail.default', $driver);
            if ($host)   Config::set('mail.mailers.smtp.host', $host);
            if ($port)   Config::set('mail.mailers.smtp.port', (int) $port);
            // Symfony Mailer only accepts 'smtp' or 'smtps'. Map legacy values.
            $schemeMap = ['tls' => 'smtp', 'ssl' => 'smtps', 'none' => null, '' => null];
            if (array_key_exists($scheme, $schemeMap)) {
                Config::set('mail.mailers.smtp.scheme', $schemeMap[$scheme]);
            } elseif ($scheme) {
                Config::set('mail.mailers.smtp.scheme', $scheme); // 'smtp' or 'smtps' pass through
            }
            if ($username) Config::set('mail.mailers.smtp.username', $username);
            if ($password) Config::set('mail.mailers.smtp.password', $password);
            if ($name)    Config::set('mail.from.name', $name);
            if ($address) Config::set('mail.from.address', $address);
        } catch (\Throwable) {
        }
    }
}
