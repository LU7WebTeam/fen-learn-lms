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
            $settings = Setting::allAsArray();

            $platformName    = trim((string) ($settings['platform_name'] ?? 'Free LMS'));
            $platformTagline = trim((string) ($settings['platform_tagline'] ?? ''));
            $logoPath        = $settings['logo_path'] ?? null;
            $logoDarkPath    = $settings['logo_dark_path'] ?? null;
            $faviconPath     = $settings['favicon_path'] ?? null;
            $defaultLocale   = (string) ($settings['default_locale'] ?? 'en');
            $captchaConfig   = CaptchaVerifier::frontendConfig();
            $analyticsConfig = [
                'enabled' => ($settings['analytics_enabled'] ?? '0') === '1',
                'measurement_id' => (string) ($settings['ga4_measurement_id'] ?? ''),
                'anonymize_ip' => ($settings['ga4_anonymize_ip'] ?? '1') === '1',
                'debug_mode' => ($settings['ga4_debug_mode'] ?? '0') === '1',
            ];
            $seoConfig = [
                'default_title' => trim((string) ($settings['seo_default_title'] ?? '')),
                'default_description' => trim((string) ($settings['seo_default_description'] ?? '')),
                'default_image' => trim((string) ($settings['seo_default_image'] ?? '')),
                'home_title' => trim((string) ($settings['seo_home_title'] ?? '')),
                'home_description' => trim((string) ($settings['seo_home_description'] ?? '')),
                'courses_title' => trim((string) ($settings['seo_courses_title'] ?? '')),
                'courses_description' => trim((string) ($settings['seo_courses_description'] ?? '')),
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
            $seoConfig = [
                'default_title' => '',
                'default_description' => '',
                'default_image' => '',
                'home_title' => '',
                'home_description' => '',
                'courses_title' => '',
                'courses_description' => '',
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
                'seo' => $seoConfig,
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
