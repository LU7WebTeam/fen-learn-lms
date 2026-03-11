<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $value = $setting->value;

        // Backward compatible: decrypt when value is encrypted, otherwise return raw legacy plaintext.
        if ($key === 'mail_password' && filled($value)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Throwable) {
                return $value;
            }
        }

        return $value;
    }

    public static function set(string $key, mixed $value): void
    {
        if ($key === 'mail_password') {
            $value = filled($value)
                ? Crypt::encryptString((string) $value)
                : '';
        }

        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function allAsArray(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
