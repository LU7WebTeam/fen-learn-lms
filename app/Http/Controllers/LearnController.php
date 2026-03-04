<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LearnController extends Controller
{
    public function index(Request $request, Course $course): RedirectResponse
    {
        abort_if($course->status !== 'published', 404);

        $enrollment = $request->user()->enrollments()
            ->where('course_id', $course->id)
            ->first();

        abort_unless($enrollment, 403);

        $lastId = $enrollment->last_lesson_id;
        if ($lastId) {
            return redirect()->route('learn.lesson', [$course->slug, $lastId]);
        }

        $first = $course->sections()->orderBy('order')->first()
            ?->lessons()->orderBy('order')->first();

        abort_unless($first, 404);

        return redirect()->route('learn.lesson', [$course->slug, $first->id]);
    }

    public function show(Request $request, Course $course, Lesson $lesson): Response|RedirectResponse
    {
        abort_if($course->status !== 'published', 404);

        $enrollment = $request->user()->enrollments()
            ->where('course_id', $course->id)
            ->first();

        if (!$enrollment) {
            return redirect()->route('courses.show', $course->slug)
                ->with('info', 'Enroll in this course to access lessons.');
        }

        // Full curriculum for the sidebar
        $course->load(['sections' => function ($q) {
            $q->orderBy('order')->with(['lessons' => function ($q2) {
                $q2->orderBy('order')
                    ->select(['id', 'section_id', 'title', 'type', 'duration_minutes', 'is_free_preview', 'order']);
            }]);
        }]);

        $completedIds = $enrollment->lessonProgress()
            ->whereNotNull('completed_at')
            ->pluck('lesson_id')
            ->all();

        // Flatten all lessons to find prev / next
        $allLessons = $course->sections
            ->flatMap(fn($s) => $s->lessons)
            ->values();

        $idx      = $allLessons->search(fn($l) => $l->id === $lesson->id);
        $prev     = $idx > 0 ? $allLessons[$idx - 1] : null;
        $next     = ($idx !== false && $idx < $allLessons->count() - 1) ? $allLessons[$idx + 1] : null;

        $isCompleted = in_array($lesson->id, $completedIds);

        return Inertia::render('Learn/Show', [
            'course' => [
                'id'       => $course->id,
                'title'    => $course->title,
                'slug'     => $course->slug,
                'sections' => $course->sections,
            ],
            'lesson'           => $lesson,
            'enrollment'       => [
                'id'           => $enrollment->id,
                'progress'     => $enrollment->progress_percentage,
                'completed_at' => $enrollment->completed_at,
            ],
            'completedIds'     => $completedIds,
            'isCompleted'      => $isCompleted,
            'nextLesson'       => $next ? ['id' => $next->id, 'title' => $next->title] : null,
            'prevLesson'       => $prev ? ['id' => $prev->id, 'title' => $prev->title] : null,
        ]);
    }

    public function complete(Request $request, Course $course, Lesson $lesson): RedirectResponse
    {
        $enrollment = $request->user()->enrollments()
            ->where('course_id', $course->id)
            ->firstOrFail();

        LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['enrollment_id' => $enrollment->id, 'completed_at' => now()]
        );

        // Check for course completion
        $total     = $course->lessons()->count();
        $completed = $enrollment->lessonProgress()->whereNotNull('completed_at')->count();

        if ($total > 0 && $completed >= $total && !$enrollment->completed_at) {
            $enrollment->update([
                'completed_at'     => now(),
                'certificate_uuid' => (string) Str::uuid(),
            ]);
        }

        return back()->with('success', 'Lesson marked complete.');
    }
}
