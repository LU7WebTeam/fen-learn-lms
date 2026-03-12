<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'causer_id' => $request->string('causer_id')->toString(),
            'subject_type' => $request->string('subject_type')->toString(),
            'event' => $request->string('event')->toString(),
            'date_from' => $request->string('date_from')->toString(),
            'date_to' => $request->string('date_to')->toString(),
        ];

        $baseQuery = Activity::query()->where('log_name', 'admin');

        $activitiesQuery = (clone $baseQuery)
            ->with('causer')
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

        $activities = $activitiesQuery
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
}