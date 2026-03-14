<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Support\CaptchaVerifier;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        try {
            $platformName    = Setting::get('platform_name', 'Free LMS');
            $platformTagline = Setting::get('platform_tagline', '');
            $logoPath        = Setting::get('logo_path');
            $faviconPath     = Setting::get('favicon_path');
            $captchaConfig   = CaptchaVerifier::frontendConfig();
            $analyticsConfig = [
                'enabled' => Setting::get('analytics_enabled', '0') === '1',
                'measurement_id' => (string) Setting::get('ga4_measurement_id', ''),
                'anonymize_ip' => Setting::get('ga4_anonymize_ip', '1') === '1',
                'debug_mode' => Setting::get('ga4_debug_mode', '0') === '1',
            ];
        } catch (\Throwable) {
            $platformName    = 'Free LMS';
            $platformTagline = '';
            $logoPath        = null;
            $faviconPath     = null;
            $captchaConfig   = [
                'provider' => 'none',
                'site_key' => '',
                'min_score' => 0.5,
                'configured' => false,
                'enabled' => [
                    'login' => false,
                    'register' => false,
                    'forgot_password' => false,
                ],
            ];
            $analyticsConfig = [
                'enabled' => false,
                'measurement_id' => '',
                'anonymize_ip' => true,
                'debug_mode' => false,
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success'     => $request->session()->get('success'),
                'error'       => $request->session()->get('error'),
                'quiz_result' => $request->session()->get('quiz_result'),
            ],
            'locale'   => $request->session()->get('locale', 'en'),
            'platform' => [
                'name'        => $platformName,
                'tagline'     => $platformTagline,
                'logo_url'    => $logoPath ? asset('storage/' . $logoPath) : null,
                'favicon_url' => $faviconPath ? asset('storage/' . $faviconPath) : null,
            ],
            'integrations' => [
                'captcha' => $captchaConfig,
                'analytics' => $analyticsConfig,
            ],
        ];
    }
}
