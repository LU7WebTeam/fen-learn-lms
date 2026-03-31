<?php

namespace App\Support;

use App\Models\Setting;

class EmailBranding
{
    public static function data(): array
    {
        $platformName = Setting::get('platform_name', config('app.name', 'LMS'));
        $logoPath = Setting::get('logo_path');
        $logoDarkPath = Setting::get('logo_dark_path');
        $emailLogoPath = Setting::get('email_logo_path');
        $emailLogoDarkPath = Setting::get('email_logo_dark_path');

        return [
            'platformName' => $platformName,
            'logoUrl' => ($emailLogoPath ?: $logoPath) ? asset('storage/'.($emailLogoPath ?: $logoPath)) : null,
            'logoDarkUrl' => ($emailLogoDarkPath ?: $logoDarkPath) ? asset('storage/'.($emailLogoDarkPath ?: $logoDarkPath)) : null,
            // These values mirror the app's visual direction for email-safe clients.
            'theme' => [
                'primary' => '#B5236F',
                'secondary' => '#4B5FCF',
                'surface' => '#FFFFFF',
                'background' => '#F8F8FB',
                'text' => '#27272A',
                'mutedText' => '#71717A',
                'border' => '#E4E4E7',
            ],
        ];
    }
}
