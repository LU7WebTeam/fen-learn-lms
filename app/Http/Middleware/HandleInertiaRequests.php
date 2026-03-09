<?php

namespace App\Http\Middleware;

use App\Models\Setting;
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
        } catch (\Throwable) {
            $platformName    = 'Free LMS';
            $platformTagline = '';
            $logoPath        = null;
            $faviconPath     = null;
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
        ];
    }
}
