<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $enrollments = $user->enrollments()
            ->with(['course' => function ($q) {
                $q->select('id', 'title', 'slug', 'cover_image', 'category', 'difficulty');
            }, 'lessonProgress'])
            ->get()
            ->map(function ($enrollment) {
                $total = $enrollment->course->lessons()->count();
                $completed = $enrollment->lessonProgress->whereNotNull('completed_at')->count();
                $progress = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

                $lastLesson = $enrollment->lessonProgress()
                    ->whereNotNull('completed_at')
                    ->latest('completed_at')
                    ->first();

                return [
                    'id'           => $enrollment->id,
                    'course'       => $enrollment->course,
                    'progress'     => $progress,
                    'is_completed' => $enrollment->completed_at !== null,
                    'last_lesson_id' => $lastLesson?->lesson_id,
                    'certificate_uuid' => $enrollment->certificate_uuid,
                    'enrolled_at'  => $enrollment->enrolled_at,
                ];
            });

        $inProgress  = $enrollments->filter(fn($e) => !$e['is_completed'])->values();
        $completed   = $enrollments->filter(fn($e) => $e['is_completed'])->values();

        $learnerActivity = Activity::query()
            ->where('log_name', 'learner_course')
            ->where('causer_id', $user->id)
            ->latest()
            ->limit(200)
            ->get()
            ->map(function (Activity $activity) {
                $properties = $activity->properties?->toArray() ?? [];

                return [
                    'id' => $activity->id,
                    'event' => $activity->event,
                    'description' => $activity->description,
                    'created_at' => $activity->created_at?->format('M j, Y g:i A'),
                    'course_title' => $properties['course_title'] ?? null,
                    'properties' => [
                        'lesson_title' => $properties['lesson_title'] ?? null,
                        'percentage' => $properties['percentage'] ?? null,
                        'passed' => $properties['passed'] ?? null,
                    ],
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Learner/Dashboard', [
            'inProgress' => $inProgress,
            'completed'  => $completed,
            'learnerActivity' => $learnerActivity,
        ]);
    }
}
