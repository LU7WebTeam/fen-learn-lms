<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $this->filtersFromRequest($request);

        $baseQuery = Activity::query()->where('log_name', 'admin');

        $activities = $this->filteredActivitiesQuery($filters)
            ->with('causer')
            ->latest()
            ->paginate(50)
            ->withQueryString()
            ->through(function (Activity $activity) {
                $properties = $activity->properties?->toArray() ?? [];

                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'event' => $activity->event,
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
                    'properties' => [
                        'updated_fields' => $properties['updated_fields'] ?? [],
                        'source_course_id' => $properties['source_course_id'] ?? null,
                        'source_section_id' => $properties['source_section_id'] ?? null,
                        'source_lesson_id' => $properties['source_lesson_id'] ?? null,
                        'course_id' => $properties['course_id'] ?? null,
                        'section_id' => $properties['section_id'] ?? null,
                        'lesson_count' => $properties['lesson_count'] ?? null,
                        'reason' => $properties['reason'] ?? null,
                        'old_role' => $properties['old_role'] ?? null,
                        'new_role' => $properties['new_role'] ?? null,
                        'title' => $properties['title'] ?? null,
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
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filtersFromRequest($request);

        $filename = 'admin-activity-logs-'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($filters) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'timestamp',
                'actor_name',
                'actor_email',
                'event',
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
            ]);

            $this->filteredActivitiesQuery($filters)
                ->with('causer')
                ->latest('created_at')
                ->chunkById(500, function ($activities) use ($handle) {
                    foreach ($activities as $activity) {
                        $properties = $activity->properties?->toArray() ?? [];
                        $updatedFields = $properties['updated_fields'] ?? [];

                        fputcsv($handle, [
                            $activity->created_at?->toIso8601String(),
                            $activity->causer?->name,
                            $activity->causer?->email,
                            $activity->event,
                            $activity->description,
                            class_basename((string) $activity->subject_type),
                            $activity->subject_id,
                            implode('|', $updatedFields),
                            $properties['reason'] ?? null,
                            $properties['old_role'] ?? null,
                            $properties['new_role'] ?? null,
                            $properties['source_course_id'] ?? null,
                            $properties['source_section_id'] ?? null,
                            $properties['source_lesson_id'] ?? null,
                        ]);
                    }
                });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function filtersFromRequest(Request $request): array
    {
        $validated = $request->validate([
            'causer_id' => ['nullable', 'integer'],
            'subject_type' => ['nullable', 'string', 'max:255'],
            'event' => ['nullable', 'string', 'max:100'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        return [
            'causer_id' => isset($validated['causer_id']) ? (string) $validated['causer_id'] : '',
            'subject_type' => $validated['subject_type'] ?? '',
            'event' => $validated['event'] ?? '',
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
            ->when($filters['subject_type'] !== '', function ($query) use ($filters) {
                $query->where('subject_type', $filters['subject_type']);
            })
            ->when($filters['event'] !== '', function ($query) use ($filters) {
                $query->where('event', $filters['event']);
            })
            ->when($filters['date_from'] !== '', function ($query) use ($filters) {
                $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
            })
            ->when($filters['date_to'] !== '', function ($query) use ($filters) {
                $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
            });
    }
}