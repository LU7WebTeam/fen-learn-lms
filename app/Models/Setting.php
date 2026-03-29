<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    private const ENCRYPTED_KEYS = [
        'mail_password',
        'captcha_secret_key',
    ];

    private static function tableExists(): bool
    {
        try {
            return Schema::hasTable((new static)->getTable());
        } catch (\Throwable) {
            return false;
        }
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        if (!self::tableExists()) {
            return $default;
        }

        $setting = static::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }

        $value = $setting->value;

        // Backward compatible: decrypt when value is encrypted, otherwise return raw legacy plaintext.
        if (in_array($key, self::ENCRYPTED_KEYS, true) && filled($value)) {
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
        if (!self::tableExists()) {
            return;
        }

        if (in_array($key, self::ENCRYPTED_KEYS, true)) {
            $value = filled($value)
                ? Crypt::encryptString((string) $value)
                : '';
        }

        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function allAsArray(): array
    {
        if (!self::tableExists()) {
            return [];
        }

        return static::pluck('value', 'key')->toArray();
    }
}
