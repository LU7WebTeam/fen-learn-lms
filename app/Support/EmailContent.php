<?php

namespace App\Support;

use App\Models\Setting;

class EmailContent
{
    public static function get(string $key, string $default, array $tokens = []): string
    {
        $value = (string) Setting::get($key, $default);

        return strtr($value, self::normalizeTokens($tokens));
    }

    public static function resolveSecondaryEnglish(
        string $englishValue,
        string $bmValue,
        string $englishFallback,
        array $tokens = []
    ): string {
        $english = trim($englishValue);
        $bm = trim($bmValue);

        if ($english === '' || strcasecmp($english, $bm) === 0 || self::looksMalayLike($english)) {
            return strtr($englishFallback, self::normalizeTokens($tokens));
        }

        return $englishValue;
    }

    private static function normalizeTokens(array $tokens): array
    {
        $normalized = [];

        foreach ($tokens as $key => $value) {
            $normalized['{{'.$key.'}}'] = (string) $value;
        }

        return $normalized;
    }

    private static function looksMalayLike(string $text): bool
    {
        return (bool) preg_match('/\b(anda|sila|telah|log masuk|pengesahan|kata laluan|tetapkan semula|jemput|jemputan|kursus|selesai|e-mel|di bawah|minit|abaikan|akaun|sijil)\b/i', $text);
    }
}
