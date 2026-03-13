<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Mail;
use App\Models\Setting;
use Spatie\Activitylog\Models\Activity;

class ActivityLogger
{
    public static function record(
        string $description,
        ?Model $subject = null,
        array $properties = [],
        ?string $event = null,
        string $logName = 'admin',
    ): void {
        $logger = activity($logName);

        if (auth()->check()) {
            $logger->causedBy(auth()->user());
        }

        if ($subject) {
            $logger->performedOn($subject);
        }

        if (! empty($properties)) {
            $logger->withProperties($properties);
        }

        if ($event) {
            $logger->event($event);
        }

        /** @var Activity $entry */
        $entry = $logger->log($description);

        self::sendHighRiskAlertIfNeeded($entry, $description, $event, $properties, $subject);
    }

    public static function changedFields(array $before, array $after): array
    {
        $changed = [];

        foreach ($after as $key => $value) {
            if (($before[$key] ?? null) !== $value) {
                $changed[] = $key;
            }
        }

        return $changed;
    }

    private static function sendHighRiskAlertIfNeeded(
        Activity $entry,
        string $description,
        ?string $event,
        array $properties,
        ?Model $subject,
    ): void {
        if ($entry->log_name !== 'admin') {
            return;
        }

        if (Setting::get('activity_log_alert_enabled', '0') !== '1') {
            return;
        }

        $isHighRisk = self::isHighRisk($description, $event, $properties, $subject);
        if (! $isHighRisk) {
            return;
        }

        $recipients = array_values(array_filter(array_map(
            fn ($email) => trim($email),
            explode(',', (string) Setting::get('activity_log_alert_recipients', ''))
        )));

        if (empty($recipients)) {
            return;
        }

        $actor = auth()->user();
        $subjectType = $subject ? class_basename($subject::class) : (class_basename((string) $entry->subject_type) ?: 'N/A');
        $subjectId = $subject?->getKey() ?? $entry->subject_id;

        $lines = [
            'High-risk admin activity detected.',
            '',
            'Description: '.$description,
            'Event: '.($event ?? $entry->event ?? 'N/A'),
            'Actor: '.($actor?->name ?? 'System'),
            'Actor email: '.($actor?->email ?? 'N/A'),
            'Subject: '.$subjectType.' #'.($subjectId ?? 'N/A'),
            'Time: '.now()->toDateTimeString(),
            '',
            'Properties:',
            json_encode($properties, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        ];

        try {
            Mail::raw(implode("\n", $lines), function ($message) use ($recipients) {
                $message->to($recipients)->subject('[Critical] Admin activity alert');
            });
        } catch (\Throwable $e) {
            report($e);
        }
    }

    private static function isHighRisk(string $description, ?string $event, array $properties, ?Model $subject): bool
    {
        $descriptionLower = strtolower($description);
        $eventLower = strtolower((string) $event);
        $subjectType = strtolower($subject ? class_basename($subject::class) : '');

        if ($subjectType === 'setting' || str_contains($descriptionLower, 'setting')) {
            return true;
        }

        if ($subjectType === 'user' || isset($properties['old_role']) || isset($properties['new_role'])) {
            return true;
        }

        if (str_contains($descriptionLower, 'suspend') || isset($properties['reason'])) {
            return true;
        }

        return in_array($eventLower, ['deleted', 'destroyed'], true) && $subjectType === 'user';
    }
}