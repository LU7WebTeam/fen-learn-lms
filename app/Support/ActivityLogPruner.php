<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;

class ActivityLogPruner
{
    public function pruneFromSettings(?int $overrideDays = null, ?bool $overrideArchive = null): array
    {
        $retentionDays = $overrideDays ?? (int) Setting::get('activity_log_retention_days', '180');
        $archiveBeforePrune = $overrideArchive ?? (Setting::get('activity_log_archive_before_prune', '1') === '1');

        if ($retentionDays < 1) {
            $retentionDays = 1;
        }

        $cutoff = Carbon::now()->subDays($retentionDays);

        $query = Activity::query()
            ->where('log_name', 'admin')
            ->where('created_at', '<', $cutoff);

        $count = (clone $query)->count();
        $archivePath = null;

        if ($count > 0 && $archiveBeforePrune) {
            $rows = (clone $query)
                ->orderBy('id')
                ->get()
                ->map(fn (Activity $activity) => [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'subject_type' => $activity->subject_type,
                    'subject_id' => $activity->subject_id,
                    'causer_type' => $activity->causer_type,
                    'causer_id' => $activity->causer_id,
                    'properties' => $activity->properties?->toArray() ?? [],
                    'created_at' => $activity->created_at?->toIso8601String(),
                ])
                ->all();

            $archivePath = 'activity-log-archives/admin-activity-archive-'.now()->format('Ymd_His').'.json';

            Storage::disk('local')->put($archivePath, json_encode([
                'exported_at' => now()->toIso8601String(),
                'retention_days' => $retentionDays,
                'count' => count($rows),
                'data' => $rows,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        $deletedCount = $query->delete();

        return [
            'retention_days' => $retentionDays,
            'cutoff' => $cutoff->toIso8601String(),
            'deleted_count' => $deletedCount,
            'archive_path' => $archivePath,
        ];
    }
}
