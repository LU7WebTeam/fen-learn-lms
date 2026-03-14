<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class SystemLogReader
{
    public function read(array $filters = []): Collection
    {
        $entries = collect();
        $redactionEnabled = $this->redactionEnabled();
        $redactedKeys = $this->redactedKeys();

        foreach ($this->logFiles() as $filePath) {
            $lines = @file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

            foreach ($lines as $line) {
                $entry = $this->parseLine($line, basename($filePath));
                if ($entry) {
                    if ($redactionEnabled) {
                        $entry = $this->applyRedaction($entry, $redactedKeys);
                    }

                    $entries->push($entry);
                }
            }
        }

        return $entries
            ->filter(fn (array $entry) => $this->matchesFilters($entry, $filters))
            ->sortByDesc('timestamp_unix')
            ->values();
    }

    public function availableLevels(): array
    {
        return ['debug', 'info', 'warning', 'error'];
    }

    private function logFiles(): array
    {
        $dailyFiles = glob(storage_path('logs/system-*.log')) ?: [];
        $fallbackFiles = glob(storage_path('logs/system.log')) ?: [];
        $files = array_merge($dailyFiles, $fallbackFiles);

        usort($files, fn (string $left, string $right) => strcmp($right, $left));

        return $files;
    }

    private function parseLine(string $line, string $sourceFile): ?array
    {
        $pattern = '/^\[(?<timestamp>[^\]]+)\]\s+(?<env>[^.]+)\.(?<level>[A-Z]+):\s+(?<message>.*?)(?:\s(?<context>\{.*\}|\[.*\]))\s(?<extra>\{.*\}|\[.*\])$/';

        if (!preg_match($pattern, $line, $matches)) {
            $fallbackPattern = '/^\[(?<timestamp>[^\]]+)\]\s+(?<env>[^.]+)\.(?<level>[A-Z]+):\s+(?<message>.*)$/';
            if (!preg_match($fallbackPattern, $line, $matches)) {
                return null;
            }
        }

        try {
            $timestamp = Carbon::parse($matches['timestamp']);
        } catch (\Throwable) {
            return null;
        }

        $context = [];
        if (!empty($matches['context'])) {
            $decoded = json_decode($matches['context'], true);
            if (is_array($decoded)) {
                $context = $decoded;
            }
        }

        return [
            'timestamp' => $timestamp->format('M j, Y g:i:s A'),
            'timestamp_raw' => $timestamp->toIso8601String(),
            'timestamp_unix' => $timestamp->timestamp,
            'date' => $timestamp->toDateString(),
            'environment' => $matches['env'] ?? 'local',
            'level' => strtolower($matches['level'] ?? 'info'),
            'message' => trim((string) ($matches['message'] ?? '')),
            'request_id' => $context['request_id'] ?? null,
            'user_id' => $context['user_id'] ?? null,
            'route_name' => $context['route_name'] ?? null,
            'request_path' => $context['request_path'] ?? null,
            'request_method' => $context['request_method'] ?? null,
            'request_ip' => $context['request_ip'] ?? null,
            'context' => $context,
            'source_file' => $sourceFile,
            'raw_line' => $line,
        ];
    }

    private function matchesFilters(array $entry, array $filters): bool
    {
        if (($filters['level'] ?? '') !== '' && $entry['level'] !== $filters['level']) {
            return false;
        }

        if (($filters['date_from'] ?? '') !== '' && $entry['date'] < $filters['date_from']) {
            return false;
        }

        if (($filters['date_to'] ?? '') !== '' && $entry['date'] > $filters['date_to']) {
            return false;
        }

        if (($filters['request_id'] ?? '') !== '' && stripos((string) ($entry['request_id'] ?? ''), (string) $filters['request_id']) === false) {
            return false;
        }

        if (($filters['user_id'] ?? '') !== '' && (string) ($entry['user_id'] ?? '') !== (string) $filters['user_id']) {
            return false;
        }

        if (($filters['search'] ?? '') !== '') {
            $haystack = strtolower($entry['message'].' '.json_encode($entry['context'], JSON_UNESCAPED_UNICODE));
            if (!str_contains($haystack, strtolower((string) $filters['search']))) {
                return false;
            }
        }

        return true;
    }

    private function redactionEnabled(): bool
    {
        try {
            return Setting::get('system_log_redaction_enabled', '1') === '1';
        } catch (\Throwable) {
            return true;
        }
    }

    private function redactedKeys(): array
    {
        $defaults = 'email,password,token,secret,authorization,cookie,set-cookie,api_key,api-key,captcha_secret_key,mail_password';

        try {
            $csv = (string) Setting::get('system_log_redacted_keys', $defaults);
        } catch (\Throwable) {
            $csv = $defaults;
        }

        return collect(explode(',', $csv))
            ->map(fn (string $key) => strtolower(trim($key)))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function applyRedaction(array $entry, array $redactedKeys): array
    {
        $redactedContext = $this->redactArray((array) ($entry['context'] ?? []), $redactedKeys);

        $entry['context'] = $redactedContext;
        $entry['request_id'] = $redactedContext['request_id'] ?? $entry['request_id'] ?? null;
        $entry['user_id'] = $redactedContext['user_id'] ?? $entry['user_id'] ?? null;
        $entry['route_name'] = $redactedContext['route_name'] ?? $entry['route_name'] ?? null;
        $entry['request_path'] = $redactedContext['request_path'] ?? $entry['request_path'] ?? null;
        $entry['request_method'] = $redactedContext['request_method'] ?? $entry['request_method'] ?? null;
        $entry['request_ip'] = $redactedContext['request_ip'] ?? $entry['request_ip'] ?? null;

        // Prevent exposing unredacted payload through fallback/raw content.
        $entry['raw_line'] = null;

        return $entry;
    }

    private function redactArray(array $data, array $redactedKeys): array
    {
        $redacted = [];

        foreach ($data as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            if (in_array($normalizedKey, $redactedKeys, true)) {
                $redacted[$key] = '[REDACTED]';
                continue;
            }

            if (is_array($value)) {
                $redacted[$key] = $this->redactArray($value, $redactedKeys);
                continue;
            }

            $redacted[$key] = $value;
        }

        return $redacted;
    }
}
