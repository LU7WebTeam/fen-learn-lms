<?php

namespace App\Support;

use App\Models\Setting;

class EmailBranding
{
    /**
     * Build a direct S3 URL from a stored relative path.
     *
     * We intentionally bypass Storage::url() here. In Replit's production
     * environment the platform injects AWS_URL pointing to its own internal
     * object-storage proxy (hostname "storage"). That value gets baked into
     * the Flysystem S3 disk's "url" key during config:cache, so Storage::url()
     * in the queue worker returns "http://storage/…" instead of the real S3
     * URL. By constructing the URL from AWS_BUCKET + AWS_DEFAULT_REGION
     * (our own Replit Secrets, always correct) we are immune to that injection.
     */
    public static function s3Url(?string $path): ?string
    {
        if (!filled((string) $path)) {
            return null;
        }

        $bucket = config('filesystems.disks.s3.bucket');
        $region = config('filesystems.disks.s3.region');

        return "https://{$bucket}.s3.{$region}.amazonaws.com/" . ltrim((string) $path, '/');
    }

    public static function data(): array
    {
        $platformName = Setting::get('platform_name', config('app.name', 'LMS'));
        $logoPath = Setting::get('logo_path');
        $logoDarkPath = Setting::get('logo_dark_path');
        $emailLogoPath = Setting::get('email_logo_path');
        $emailLogoDarkPath = Setting::get('email_logo_dark_path');

        $lightPath = $emailLogoPath ?: $logoPath;
        $darkPath  = $emailLogoDarkPath ?: $logoDarkPath;

        return [
            'platformName' => $platformName,
            'logoUrl'      => self::s3Url($lightPath),
            'logoDarkUrl'  => self::s3Url($darkPath),
            // These values mirror the app's visual direction for email-safe clients.
            'theme' => [
                'primary'    => '#B5236F',
                'secondary'  => '#4B5FCF',
                'surface'    => '#FFFFFF',
                'background' => '#F8F8FB',
                'text'       => '#27272A',
                'mutedText'  => '#71717A',
                'border'     => '#E4E4E7',
            ],
        ];
    }
}
