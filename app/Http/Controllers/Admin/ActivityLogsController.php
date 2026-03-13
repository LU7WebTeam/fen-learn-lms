<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\ActivityLogPruner;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogsController extends Controller
{
    private const LOG_SETTINGS_DEFAULTS = [
        'activity_log_retention_days' => '180',
        'activity_log_archive_before_prune' => '1',
        'activity_log_alert_enabled' => '0',
        'activity_log_alert_recipients' => '',
        'activity_log_redaction_enabled' => '0',
        'activity_log_redacted_keys' => 'email,password,token,remember_token,suspension_reason',
        'editor_can_view_activity_logs' => '1',
        'editor_can_export_activity_logs' => '0',
    ];

    public function index(Request $request): Response
    {
        $this->authorizeView($request);

        $filters = $this->filtersFromRequest($request);
        $logSettings = $this->activityLogSettings();
        $redactionEnabled = $logSettings['activity_log_redaction_enabled'] === '1';
        $redactedKeys = $this->redactedKeysFromSettings($logSettings);

        $baseQuery = Activity::query()->where('log_name', 'admin');

        $activities = $this->filteredActivitiesQuery($filters)
            ->with('causer')
            ->latest()
            ->paginate(50)
            ->withQueryString()
            ->through(function (Activity $activity) use ($redactionEnabled, $redactedKeys) {
                $properties = $activity->properties?->toArray() ?? [];
                $safeProperties = $redactionEnabled
                    ? $this->redactArray($properties, $redactedKeys)
                    : $properties;

                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'risk_level' => $this->riskLevel($activity, $properties),
                    'created_at' => $activity->created_at?->format('M j, Y g:i A'),
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'subject' => [
                        'type' => class_basename((string) $activity->subject_type),
                        'id' => $activity->subject_id,
                    ],
                    'raw_properties' => $safeProperties,
                    'properties' => [
                        'updated_fields' => $safeProperties['updated_fields'] ?? [],
                        'source_course_id' => $safeProperties['source_course_id'] ?? null,
                        'source_section_id' => $safeProperties['source_section_id'] ?? null,
                        'source_lesson_id' => $safeProperties['source_lesson_id'] ?? null,
                        'course_id' => $safeProperties['course_id'] ?? null,
                        'section_id' => $safeProperties['section_id'] ?? null,
                        'lesson_count' => $safeProperties['lesson_count'] ?? null,
                        'reason' => $safeProperties['reason'] ?? null,
                        'old_role' => $safeProperties['old_role'] ?? null,
                        'new_role' => $safeProperties['new_role'] ?? null,
                        'title' => $safeProperties['title'] ?? null,
                    ],
                ];
            });

        $actors = (clone $baseQuery)
            ->whereNotNull('causer_id')
            ->whereNotNull('causer_type')
            ->with('causer')
            ->latest()
            ->get()
            ->pluck('causer')
            ->filter()
            ->unique('id')
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]);

        $subjectTypes = (clone $baseQuery)
            ->whereNotNull('subject_type')
            ->distinct('subject_type')
            ->pluck('subject_type')
            ->filter()
            ->sort()
            ->values()
            ->map(fn ($type) => [
                'value' => $type,
                'label' => class_basename((string) $type),
            ]);

        $events = (clone $baseQuery)
            ->whereNotNull('event')
            ->distinct('event')
            ->pluck('event')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('Admin/ActivityLogs/Index', [
            'activities' => $activities,
            'filters' => $filters,
            'options' => [
                'actors' => $actors,
                'subjectTypes' => $subjectTypes,
                'events' => $events,
            ],
            'capabilities' => [
                'canExport' => $this->canExport($request),
                'canManageLogPolicies' => $request->user()?->isSuperAdmin() ?? false,
            ],
            'logSettings' => $logSettings,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeExport($request);

        $filters = $this->filtersFromRequest($request);
        $logSettings = $this->activityLogSettings();
        $redactionEnabled = $logSettings['activity_log_redaction_enabled'] === '1';
        $redactedKeys = $this->redactedKeysFromSettings($logSettings);
        $detailed = $request->boolean('detailed');

        $filename = 'admin-activity-logs-'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($filters, $detailed, $redactionEnabled, $redactedKeys) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, ['# exported_at', now()->toIso8601String()]);
            fputcsv($handle, ['# filters', json_encode($filters, JSON_UNESCAPED_UNICODE)]);
            fputcsv($handle, ['# detailed', $detailed ? '1' : '0']);
            fputcsv($handle, []);

            $baseColumns = [
                'timestamp',
                'actor_name',
                'actor_email',
                'event',
                'risk_level',
                'description',
                'subject_type',
                'subject_id',
                'changed_fields',
                'reason',
                'old_role',
                'new_role',
                'source_course_id',
                'source_section_id',
                'source_lesson_id',
            ];

            if (! $detailed) {
                fputcsv($handle, $baseColumns);

                $this->filteredActivitiesQuery($filters)
                    ->with('causer')
                    ->latest('created_at')
                    ->chunkById(500, function ($activities) use ($handle, $redactionEnabled, $redactedKeys) {
                        foreach ($activities as $activity) {
                            $row = $this->mapActivityForExport($activity, false, $redactionEnabled, $redactedKeys);
                            fputcsv($handle, array_map(fn ($column) => $row[$column] ?? null, [
                                'timestamp',
                                'actor_name',
                                'actor_email',
                                'event',
                                'risk_level',
                                'description',
                                'subject_type',
                                'subject_id',
                                'changed_fields',
                                'reason',
                                'old_role',
                                'new_role',
                                'source_course_id',
                                'source_section_id',
                                'source_lesson_id',
                            ]));
                        }
                    });

                fclose($handle);

                return;
            }

            $allActivities = $this->filteredActivitiesQuery($filters)
                ->with('causer')
                ->latest('created_at')
                ->get();

            $flatKeys = [];
            foreach ($allActivities as $activity) {
                $properties = $activity->properties?->toArray() ?? [];
                $safe = $redactionEnabled ? $this->redactArray($properties, $redactedKeys) : $properties;
                $flat = $this->flattenArray($safe);
                foreach (array_keys($flat) as $key) {
                    $flatKeys[$key] = true;
                }
            }

            $flatColumns = array_map(fn ($key) => 'property_'.$key, array_keys($flatKeys));
            fputcsv($handle, [...$baseColumns, 'raw_properties_json', ...$flatColumns]);

            foreach ($allActivities as $activity) {
                $row = $this->mapActivityForExport($activity, true, $redactionEnabled, $redactedKeys);
                $flatValues = [];
                foreach ($flatColumns as $flatColumn) {
                    $propKey = substr($flatColumn, strlen('property_'));
                    $flatValues[] = $row['flat_properties'][$propKey] ?? null;
                }

                fputcsv($handle, [
                    $row['timestamp'],
                    $row['actor_name'],
                    $row['actor_email'],
                    $row['event'],
                    $row['risk_level'],
                    $row['description'],
                    $row['subject_type'],
                    $row['subject_id'],
                    $row['changed_fields'],
                    $row['reason'],
                    $row['old_role'],
                    $row['new_role'],
                    $row['source_course_id'],
                    $row['source_section_id'],
                    $row['source_lesson_id'],
                    $row['raw_properties_json'],
                    ...$flatValues,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function exportJson(Request $request): JsonResponse
    {
        $this->authorizeExport($request);

        $filters = $this->filtersFromRequest($request);
        $logSettings = $this->activityLogSettings();
        $redactionEnabled = $logSettings['activity_log_redaction_enabled'] === '1';
        $redactedKeys = $this->redactedKeysFromSettings($logSettings);
        $detailed = $request->boolean('detailed');

        $data = $this->filteredActivitiesQuery($filters)
            ->with('causer')
            ->latest('created_at')
            ->get()
            ->map(fn (Activity $activity) => $this->mapActivityForExport($activity, $detailed, $redactionEnabled, $redactedKeys));

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'filters' => $filters,
            'columns' => [
                'timestamp',
                'actor_name',
                'actor_email',
                'event',
                'risk_level',
                'description',
                'subject_type',
                'subject_id',
                'changed_fields',
                'reason',
                'old_role',
                'new_role',
                'source_course_id',
                'source_section_id',
                'source_lesson_id',
            ],
            'detailed' => $detailed,
            'count' => $data->count(),
            'data' => $data,
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Only super admins can manage activity log policies.');
        }

        $validated = $request->validate([
            'activity_log_retention_days' => ['required', 'integer', 'min:1', 'max:3650'],
            'activity_log_archive_before_prune' => ['required', 'in:0,1'],
            'activity_log_alert_enabled' => ['required', 'in:0,1'],
            'activity_log_alert_recipients' => ['nullable', 'string', 'max:2000'],
            'activity_log_redaction_enabled' => ['required', 'in:0,1'],
            'activity_log_redacted_keys' => ['nullable', 'string', 'max:1000'],
            'editor_can_view_activity_logs' => ['required', 'in:0,1'],
            'editor_can_export_activity_logs' => ['required', 'in:0,1'],
        ]);

        foreach (self::LOG_SETTINGS_DEFAULTS as $key => $default) {
            Setting::set($key, (string) ($validated[$key] ?? $default));
        }

        return back()->with('success', 'Activity log policies saved.');
    }

    public function pruneNow(Request $request, ActivityLogPruner $pruner): RedirectResponse
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Only super admins can prune activity logs.');
        }

        $summary = $pruner->pruneFromSettings();

        $message = 'Prune completed. Deleted '.$summary['deleted_count'].' log(s).';
        if (! empty($summary['archive_path'])) {
            $message .= ' Archive saved to '.$summary['archive_path'].'.';
        }

        return back()->with('success', $message);
    }

    private function filtersFromRequest(Request $request): array
    {
        $validated = $request->validate([
            'causer_id' => ['nullable', 'integer'],
            'subject_type' => ['nullable', 'string', 'max:255'],
            'subject_types' => ['nullable', 'array'],
            'subject_types.*' => ['string', 'max:255'],
            'event' => ['nullable', 'string', 'max:100'],
            'events' => ['nullable', 'array'],
            'events.*' => ['string', 'max:100'],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $subjectTypes = $validated['subject_types'] ?? [];
        if (($validated['subject_type'] ?? '') !== '') {
            $subjectTypes[] = $validated['subject_type'];
        }

        $events = $validated['events'] ?? [];
        if (($validated['event'] ?? '') !== '') {
            $events[] = $validated['event'];
        }

        return [
            'causer_id' => isset($validated['causer_id']) ? (string) $validated['causer_id'] : '',
            'subject_types' => array_values(array_unique(array_filter($subjectTypes))),
            'events' => array_values(array_unique(array_filter($events))),
            'search' => trim((string) ($validated['search'] ?? '')),
            'date_from' => isset($validated['date_from']) ? Carbon::parse($validated['date_from'])->toDateString() : '',
            'date_to' => isset($validated['date_to']) ? Carbon::parse($validated['date_to'])->toDateString() : '',
        ];
    }

    private function filteredActivitiesQuery(array $filters): Builder
    {
        return Activity::query()
            ->where('log_name', 'admin')
            ->when($filters['causer_id'] !== '', function ($query) use ($filters) {
                $query->where('causer_id', (int) $filters['causer_id']);
            })
            ->when(! empty($filters['subject_types']), function ($query) use ($filters) {
                $query->whereIn('subject_type', $filters['subject_types']);
            })
            ->when(! empty($filters['events']), function ($query) use ($filters) {
                $query->whereIn('event', $filters['events']);
            })
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = '%'.$filters['search'].'%';
                $query->where(function ($nested) use ($search) {
                    $nested->where('description', 'like', $search)
                        ->orWhere('properties', 'like', $search);
                });
            })
            ->when($filters['date_from'] !== '', function ($query) use ($filters) {
                $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
            })
            ->when($filters['date_to'] !== '', function ($query) use ($filters) {
                $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
            });
    }

    private function mapActivityForExport(Activity $activity, bool $detailed = false, bool $redactionEnabled = false, array $redactedKeys = []): array
    {
        $properties = $activity->properties?->toArray() ?? [];
        $safeProperties = $redactionEnabled ? $this->redactArray($properties, $redactedKeys) : $properties;
        $updatedFields = $properties['updated_fields'] ?? [];

        $row = [
            'timestamp' => $activity->created_at?->toIso8601String(),
            'actor_name' => $activity->causer?->name,
            'actor_email' => $activity->causer?->email,
            'event' => $activity->event,
            'risk_level' => $this->riskLevel($activity, $properties),
            'description' => $activity->description,
            'subject_type' => class_basename((string) $activity->subject_type),
            'subject_id' => $activity->subject_id,
            'changed_fields' => implode('|', $updatedFields),
            'reason' => $safeProperties['reason'] ?? null,
            'old_role' => $safeProperties['old_role'] ?? null,
            'new_role' => $safeProperties['new_role'] ?? null,
            'source_course_id' => $safeProperties['source_course_id'] ?? null,
            'source_section_id' => $safeProperties['source_section_id'] ?? null,
            'source_lesson_id' => $safeProperties['source_lesson_id'] ?? null,
        ];

        if (! $detailed) {
            return $row;
        }

        $row['raw_properties_json'] = json_encode($safeProperties, JSON_UNESCAPED_UNICODE);
        $row['flat_properties'] = $this->flattenArray($safeProperties);

        return $row;
    }

    private function activityLogSettings(): array
    {
        $stored = [];
        foreach (array_keys(self::LOG_SETTINGS_DEFAULTS) as $key) {
            $stored[$key] = (string) Setting::get($key, self::LOG_SETTINGS_DEFAULTS[$key]);
        }

        return array_merge(self::LOG_SETTINGS_DEFAULTS, $stored);
    }

    private function redactedKeysFromSettings(array $settings): array
    {
        $csv = (string) ($settings['activity_log_redacted_keys'] ?? '');

        return array_values(array_filter(array_map(
            fn ($key) => strtolower(trim($key)),
            explode(',', $csv)
        )));
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

    private function flattenArray(array $data, string $prefix = ''): array
    {
        $flat = [];

        foreach ($data as $key => $value) {
            $fullKey = $prefix === '' ? (string) $key : $prefix.'.'.$key;

            if (is_array($value)) {
                $flat = [...$flat, ...$this->flattenArray($value, $fullKey)];
                continue;
            }

            $flat[$fullKey] = is_bool($value) ? ($value ? 'true' : 'false') : $value;
        }

        return $flat;
    }

    private function riskLevel(Activity $activity, array $properties): string
    {
        $subjectType = strtolower(class_basename((string) $activity->subject_type));
        $description = strtolower((string) $activity->description);
        $event = strtolower((string) $activity->event);

        $highRiskSignals = [
            str_contains($description, 'role'),
            str_contains($description, 'suspend'),
            str_contains($description, 'settings'),
            isset($properties['old_role']) || isset($properties['new_role']),
            isset($properties['reason']),
            $subjectType === 'user',
        ];

        if (in_array(true, $highRiskSignals, true)) {
            return 'high';
        }

        if (in_array($event, ['deleted', 'destroyed'], true)) {
            return 'medium';
        }

        return 'normal';
    }

    private function authorizeView(Request $request): void
    {
        $user = $request->user();

        if (! $user) {
            abort(403, 'Unauthorized.');
        }

        if ($user->isSuperAdmin()) {
            return;
        }

        $allowed = Setting::get('editor_can_view_activity_logs', self::LOG_SETTINGS_DEFAULTS['editor_can_view_activity_logs']) === '1';
        if (! $allowed) {
            abort(403, 'Your role cannot view activity logs.');
        }
    }

    private function canExport(Request $request): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return Setting::get('editor_can_export_activity_logs', self::LOG_SETTINGS_DEFAULTS['editor_can_export_activity_logs']) === '1';
    }

    private function authorizeExport(Request $request): void
    {
        $this->authorizeView($request);

        if (! $this->canExport($request)) {
            abort(403, 'Your role cannot export activity logs.');
        }
    }
}