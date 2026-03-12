<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $activities = Activity::query()
            ->where('log_name', 'admin')
            ->with('causer')
            ->latest()
            ->paginate(50)
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

        return Inertia::render('Admin/ActivityLogs/Index', [
            'activities' => $activities,
        ]);
    }
}