<?php

namespace App\Providers;

use App\Support\EmailBranding;
use App\Support\EmailContent;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
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
        $this->configureBrandedAuthEmails();
    }

    private function configureBrandedAuthEmails(): void
    {
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            $branding = EmailBranding::data();
            $tokens = [
                'platform_name' => $branding['platformName'],
            ];

            $title = EmailContent::get('verification_email_title', 'Verify your email address', $tokens);
            $subject = EmailContent::get('verification_email_subject', 'Verify your email address', $tokens);
            $body = EmailContent::get(
                'verification_email_body',
                'Please confirm your email address for {{platform_name}} by clicking the button below.',
                $tokens,
            );
            $cta = EmailContent::get('verification_email_cta', 'Verify Email Address', $tokens);

            return (new MailMessage)
                ->subject($subject)
                ->view('emails.auth-verify-email', [
                    ...$branding,
                    'title' => $title,
                    'email' => $notifiable->email,
                    'actionUrl' => $url,
                    'actionText' => $cta,
                    'bodyText' => $body,
                    'expiresInMinutes' => (int) config('auth.verification.expire', 60),
                ]);
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $branding = EmailBranding::data();
            $tokens = [
                'platform_name' => $branding['platformName'],
            ];

            $title = EmailContent::get('reset_email_title', 'Reset your password', $tokens);
            $subject = EmailContent::get('reset_email_subject', 'Reset your password', $tokens);
            $body = EmailContent::get(
                'reset_email_body',
                'We received a request to reset your password for {{platform_name}}.',
                $tokens,
            );
            $cta = EmailContent::get('reset_email_cta', 'Reset Password', $tokens);

            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject($subject)
                ->view('emails.auth-reset-password', [
                    ...$branding,
                    'title' => $title,
                    'email' => $notifiable->email,
                    'actionUrl' => $resetUrl,
                    'actionText' => $cta,
                    'bodyText' => $body,
                    'expiresInMinutes' => (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60),
                ]);
        });
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
