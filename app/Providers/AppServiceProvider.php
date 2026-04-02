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
            $tokenMap = [
                '{{platform_name}}' => (string) $branding['platformName'],
            ];

            $titleEnFallback = 'Verify your email address';
            $bodyEnFallback = 'Please verify your email address for {{platform_name}} by clicking the button below.';
            $ctaEnFallback = 'Verify Email Address';

            $title = EmailContent::get('verification_email_title', $titleEnFallback, $tokens);
            $subject = EmailContent::get('verification_email_subject', 'Sahkan alamat e-mel anda', $tokens);
            $body = EmailContent::get(
                'verification_email_body',
                $bodyEnFallback,
                $tokens,
            );
            $cta = EmailContent::get('verification_email_cta', $ctaEnFallback, $tokens);

            $titleBM = EmailContent::get('verification_email_title_bm', 'Sahkan alamat email anda', $tokens);
            $bodyBM = EmailContent::get(
                'verification_email_body_bm',
                'Sila sahkan alamat email anda untuk {{platform_name}} dengan mengklik butang di bawah.',
                $tokens,
            );
            $ctaBM = EmailContent::get('verification_email_cta_bm', 'Sahkan Alamat E-mel', $tokens);

            if (trim($title) === trim($titleBM)) {
                $title = $titleEnFallback;
            }

            if (trim($body) === trim($bodyBM)) {
                $body = strtr($bodyEnFallback, $tokenMap);
            }

            if (trim($cta) === trim($ctaBM)) {
                $cta = $ctaEnFallback;
            }

            return (new MailMessage)
                ->subject($subject)
                ->view('emails.auth-verify-email', [
                    ...$branding,
                    'title' => $title,
                    'titleBM' => $titleBM,
                    'email' => $notifiable->email,
                    'actionUrl' => $url,
                    'actionText' => $cta,
                    'actionTextBM' => $ctaBM,
                    'bodyText' => $body,
                    'bodyTextBM' => $bodyBM,
                    'expiresInMinutes' => (int) config('auth.verification.expire', 60),
                ]);
        });

        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $branding = EmailBranding::data();
            $tokens = [
                'platform_name' => $branding['platformName'],
            ];
            $tokenMap = [
                '{{platform_name}}' => (string) $branding['platformName'],
            ];

            $titleEnFallback = 'Reset your password';
            $bodyEnFallback = 'We received a request to reset your password for {{platform_name}}.';
            $ctaEnFallback = 'Reset Password';

            $title = EmailContent::get('reset_email_title', $titleEnFallback, $tokens);
            $subject = EmailContent::get('reset_email_subject', 'Tetapkan semula kata laluan anda', $tokens);
            $body = EmailContent::get(
                'reset_email_body',
                $bodyEnFallback,
                $tokens,
            );
            $cta = EmailContent::get('reset_email_cta', $ctaEnFallback, $tokens);

            $titleBM = EmailContent::get('reset_email_title_bm', 'Tetapkan semula kata laluan anda', $tokens);
            $bodyBM = EmailContent::get(
                'reset_email_body_bm',
                'Kami menerima permintaan untuk menetapkan semula kata laluan anda untuk {{platform_name}}.',
                $tokens,
            );
            $ctaBM = EmailContent::get('reset_email_cta_bm', 'Tetapkan Semula Kata Laluan', $tokens);

            if (trim($title) === trim($titleBM)) {
                $title = $titleEnFallback;
            }

            if (trim($body) === trim($bodyBM)) {
                $body = strtr($bodyEnFallback, $tokenMap);
            }

            if (trim($cta) === trim($ctaBM)) {
                $cta = $ctaEnFallback;
            }

            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            return (new MailMessage)
                ->subject($subject)
                ->view('emails.auth-reset-password', [
                    ...$branding,
                    'title' => $title,
                    'titleBM' => $titleBM,
                    'email' => $notifiable->email,
                    'actionUrl' => $resetUrl,
                    'actionText' => $cta,
                    'actionTextBM' => $ctaBM,
                    'bodyText' => $body,
                    'bodyTextBM' => $bodyBM,
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
