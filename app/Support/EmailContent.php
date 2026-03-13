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

    private static function normalizeTokens(array $tokens): array
    {
        $normalized = [];

        foreach ($tokens as $key => $value) {
            $normalized['{{'.$key.'}}'] = (string) $value;
        }

        return $normalized;
    }
}
