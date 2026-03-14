<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class CaptchaVerifier
{
    public static function frontendConfig(): array
    {
        $provider = (string) Setting::get('captcha_provider', 'none');
        $siteKey = (string) Setting::get('captcha_site_key', '');
        $secretKey = (string) Setting::get('captcha_secret_key', '');

        $configured = $provider !== 'none' && $siteKey !== '' && $secretKey !== '';

        return [
            'provider' => $provider,
            'site_key' => $siteKey,
            'min_score' => (float) Setting::get('captcha_min_score', '0.5'),
            'configured' => $configured,
            'enabled' => [
                'login' => $configured && Setting::get('captcha_enabled_login', '0') === '1',
                'register' => $configured && Setting::get('captcha_enabled_register', '0') === '1',
                'forgot_password' => $configured && Setting::get('captcha_enabled_forgot_password', '0') === '1',
            ],
        ];
    }

    public static function enforce(Request $request, string $action): void
    {
        $config = self::frontendConfig();

        if (!(bool) ($config['enabled'][$action] ?? false)) {
            return;
        }

        $token = (string) $request->input('captcha_token', '');
        if ($token === '') {
            throw ValidationException::withMessages([
                'captcha_token' => 'Captcha verification is required.',
            ]);
        }

        $ok = self::verifyToken(
            provider: (string) $config['provider'],
            token: $token,
            remoteIp: (string) $request->ip(),
            minScore: (float) $config['min_score'],
            action: $action,
        );

        if (!$ok) {
            SystemLogger::write('warning', 'Captcha verification failed', [
                'captcha_action' => $action,
                'captcha_provider' => $config['provider'],
            ], $request);

            throw ValidationException::withMessages([
                'captcha_token' => 'Captcha verification failed. Please try again.',
            ]);
        }
    }

    private static function verifyToken(string $provider, string $token, string $remoteIp, float $minScore, string $action): bool
    {
        try {
            if ($provider === 'turnstile') {
                $response = Http::asForm()
                    ->timeout(8)
                    ->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                        'secret' => (string) Setting::get('captcha_secret_key', ''),
                        'response' => $token,
                        'remoteip' => $remoteIp,
                    ]);

                if (!$response->ok()) {
                    return false;
                }

                return (bool) data_get($response->json(), 'success', false);
            }

            if ($provider === 'recaptcha') {
                $response = Http::asForm()
                    ->timeout(8)
                    ->post('https://www.google.com/recaptcha/api/siteverify', [
                        'secret' => (string) Setting::get('captcha_secret_key', ''),
                        'response' => $token,
                        'remoteip' => $remoteIp,
                    ]);

                if (!$response->ok()) {
                    return false;
                }

                $payload = $response->json();
                $success = (bool) data_get($payload, 'success', false);
                $score = (float) data_get($payload, 'score', 0);
                $responseAction = (string) data_get($payload, 'action', '');

                if (!$success || $score < $minScore) {
                    return false;
                }

                if ($responseAction !== '' && $responseAction !== $action) {
                    return false;
                }

                return true;
            }
        } catch (\Throwable) {
            return false;
        }

        return true;
    }
}
