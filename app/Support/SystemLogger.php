<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SystemLogger
{
    private const LEVEL_RANK = [
        'debug' => 10,
        'info' => 20,
        'warning' => 30,
        'error' => 40,
    ];

    public static function write(string $level, string $message, array $context = [], ?Request $request = null): void
    {
        $level = strtolower($level);
        if (!isset(self::LEVEL_RANK[$level])) {
            $level = 'info';
        }

        try {
            $enabled = Setting::get('system_logging_enabled', '1') === '1';
            $configuredLevel = strtolower((string) Setting::get('system_log_level', 'info'));
            $captureContext = Setting::get('system_log_capture_context', '1') === '1';
            $retentionDays = max(1, (int) Setting::get('system_log_retention_days', '30'));
        } catch (\Throwable) {
            $enabled = true;
            $configuredLevel = 'info';
            $captureContext = true;
            $retentionDays = 30;
        }

        if (!$enabled) {
            return;
        }

        $configuredRank = self::LEVEL_RANK[$configuredLevel] ?? self::LEVEL_RANK['info'];
        if (self::LEVEL_RANK[$level] < $configuredRank) {
            return;
        }

        if ($captureContext && $request) {
            $requestId = $request->attributes->get('system_request_id')
                ?? $request->headers->get('X-Request-Id')
                ?? (string) Str::uuid();

            $request->attributes->set('system_request_id', $requestId);

            $context = array_merge($context, [
                'request_id' => $context['request_id'] ?? $requestId,
                'request_path' => $request->path(),
                'request_method' => $request->method(),
                'request_ip' => $request->ip(),
                'route_name' => optional($request->route())->getName(),
                'user_id' => optional($request->user())->id,
            ]);
        }

        Log::build([
            'driver' => 'daily',
            'path' => storage_path('logs/system.log'),
            'level' => $configuredLevel,
            'days' => $retentionDays,
            'replace_placeholders' => true,
        ])->log($level, $message, $context);
    }
}
