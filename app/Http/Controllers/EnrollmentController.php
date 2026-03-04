<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function store(Request $request, Course $course): RedirectResponse
    {
        abort_if($course->status !== 'published', 404);

        $user = $request->user();

        $enrollment = $user->enrollments()->firstOrCreate(
            ['course_id' => $course->id],
            ['enrolled_at' => now()]
        );

        // Resume from last lesson, or go to first
        $lastLessonId = $enrollment->last_lesson_id;
        if ($lastLessonId) {
            return redirect()->route('learn.lesson', [$course->slug, $lastLessonId]);
        }

        $firstLesson = $course->sections()
            ->orderBy('order')
            ->first()
            ?->lessons()
            ->orderBy('order')
            ->first();

        if ($firstLesson) {
            return redirect()->route('learn.lesson', [$course->slug, $firstLesson->id]);
        }

        return redirect()->route('courses.show', $course->slug)
            ->with('info', 'Enrolled! This course has no lessons yet.');
    }
}
