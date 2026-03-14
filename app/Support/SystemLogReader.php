<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class SystemLogReader
{
    public function read(array $filters = []): Collection
    {
        $entries = collect();

        foreach ($this->logFiles() as $filePath) {
            $lines = @file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];

            foreach ($lines as $line) {
                $entry = $this->parseLine($line, basename($filePath));
                if ($entry) {
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
}
