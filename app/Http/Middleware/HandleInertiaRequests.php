<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Support\CaptchaVerifier;
use App\Support\ProfileFieldOfStudyOptions;
use App\Support\ProfileOrganizationOptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $locale = 'en';

        try {
            $platformName    = Setting::get('platform_name', 'Free LMS');
            $platformTagline = Setting::get('platform_tagline', '');
            $logoPath        = Setting::get('logo_path');
            $logoDarkPath    = Setting::get('logo_dark_path');
            $faviconPath     = Setting::get('favicon_path');
            $defaultLocale   = (string) Setting::get('default_locale', 'en');
            $captchaConfig   = CaptchaVerifier::frontendConfig();
            $analyticsConfig = [
                'enabled' => Setting::get('analytics_enabled', '0') === '1',
                'measurement_id' => (string) Setting::get('ga4_measurement_id', ''),
                'anonymize_ip' => Setting::get('ga4_anonymize_ip', '1') === '1',
                'debug_mode' => Setting::get('ga4_debug_mode', '0') === '1',
            ];

            if (!in_array($defaultLocale, ['en', 'ms'], true)) {
                $defaultLocale = 'en';
            }

            $locale = (string) $request->session()->get('locale', $defaultLocale);
            if (!in_array($locale, ['en', 'ms'], true)) {
                $locale = $defaultLocale;
            }

            if (!$request->session()->has('locale')) {
                $request->session()->put('locale', $locale);
            }
        } catch (\Throwable) {
            $platformName    = 'Free LMS';
            $platformTagline = '';
            $logoPath        = null;
            $logoDarkPath    = null;
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

            $locale = (string) $request->session()->get('locale', 'en');
        }

        app()->setLocale($locale);

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
            'locale'   => $locale,
            'platform' => [
                'name'        => $platformName,
                'tagline'     => $platformTagline,
                'logo_url'    => $logoPath ? Storage::url($logoPath) : null,
                'logo_dark_url' => $logoDarkPath ? Storage::url($logoDarkPath) : null,
                'favicon_url' => $faviconPath ? Storage::url($faviconPath) : null,
            ],
            'integrations' => [
                'captcha' => $captchaConfig,
                'analytics' => $analyticsConfig,
            ],
            'profileOptions' => [
                'organizationOptions' => ProfileOrganizationOptions::options(),
                'organizationSelectOccupations' => ProfileOrganizationOptions::selectOccupations(),
                'organizationOtherValue' => ProfileOrganizationOptions::OTHER_VALUE,
                'fieldOfStudyOptions' => ProfileFieldOfStudyOptions::options(),
                'fieldOfStudySelectOccupations' => ProfileFieldOfStudyOptions::selectOccupations(),
                'fieldOfStudyOtherValue' => ProfileFieldOfStudyOptions::OTHER_VALUE,
            ],
        ];
    }
}
