<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Course::where('status', 'published')
            ->with('creator:id,name')
            ->withCount('lessons');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('difficulty')) {
            $query->where('difficulty', $request->difficulty);
        }

        $courses = $query->latest()->paginate(12)->withQueryString();

        $enrolledIds = [];
        if ($user = $request->user()) {
            $enrolledIds = $user->enrollments()->pluck('course_id')->all();
        }

        $categories = Course::where('status', 'published')
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return Inertia::render('Courses/Index', [
            'courses'    => $courses,
            'enrolledIds'=> $enrolledIds,
            'categories' => $categories,
            'filters'    => $request->only(['category', 'difficulty']),
        ]);
    }

    public function show(Request $request, Course $course): Response
    {
        abort_if($course->status !== 'published', 404);

        $course->load([
            'creator:id,name',
            'sections' => function ($q) {
                $q->orderBy('order')->with(['lessons' => function ($q2) {
                    $q2->orderBy('order')
                        ->select(['id', 'section_id', 'title', 'title_ms', 'type', 'duration_minutes', 'is_free_preview']);
                }]);
            },
        ]);

        $enrollment       = null;
        $completedIds     = [];
        $firstLesson      = null;
        $learnerActivity  = [];

        if ($user = $request->user()) {
            $enrollment = $user->enrollments()
                ->where('course_id', $course->id)
                ->with('lessonProgress')
                ->first();

            if ($enrollment) {
                $completedIds = $enrollment->lessonProgress
                    ->whereNotNull('completed_at')
                    ->pluck('lesson_id')
                    ->all();

                $learnerActivity = Activity::query()
                    ->where('log_name', 'learner_course')
                    ->where('causer_id', $user->id)
                    ->where('properties->course_id', $course->id)
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
                            'properties' => [
                                'lesson_title' => $properties['lesson_title'] ?? null,
                                'lesson_type' => $properties['lesson_type'] ?? null,
                                'score' => $properties['score'] ?? null,
                                'max_score' => $properties['max_score'] ?? null,
                                'percentage' => $properties['percentage'] ?? null,
                                'passed' => $properties['passed'] ?? null,
                                'attempt_number' => $properties['attempt_number'] ?? null,
                            ],
                        ];
                    })
                    ->values()
                    ->all();
            }
        }

        $firstSection = $course->sections->first();
        if ($firstSection) {
            $firstLesson = $firstSection->lessons->first();
        }

        return Inertia::render('Courses/Show', [
            'course'           => $course,
            'totalLessons'     => $course->sections->sum(fn($s) => $s->lessons->count()),
            'enrollment'       => $enrollment ? [
                'id'           => $enrollment->id,
                'progress'     => $enrollment->progress_percentage,
                'completed_at' => $enrollment->completed_at,
                'last_lesson_id' => $enrollment->last_lesson_id,
            ] : null,
            'completedIds'     => $completedIds,
            'firstLessonId'    => $firstLesson?->id,
            'learnerActivity'  => $learnerActivity,
        ]);
    }
}
