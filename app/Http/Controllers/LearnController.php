<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
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

        // For quiz lessons: strip correct answers + load last attempt
        $lessonData  = $lesson->toArray();
        $lastAttempt = null;

        if ($lesson->type === 'quiz') {
            $quizData = json_decode($lesson->content ?? '{}', true) ?? [];
            if (isset($quizData['questions'])) {
                $quizData['questions'] = array_map(function ($q) {
                    unset($q['correct']);
                    return $q;
                }, $quizData['questions']);
            }
            $lessonData['content'] = json_encode($quizData);

            $attempt = QuizAttempt::where('user_id', $request->user()->id)
                ->where('lesson_id', $lesson->id)
                ->latest()
                ->first();

            if ($attempt) {
                $lastAttempt = [
                    'score'      => $attempt->score,
                    'max_score'  => $attempt->max_score,
                    'percentage' => $attempt->percentage,
                    'passed'     => $attempt->passed,
                    'created_at' => $attempt->created_at,
                ];
            }
        }

        return Inertia::render('Learn/Show', [
            'course' => [
                'id'       => $course->id,
                'title'    => $course->title,
                'slug'     => $course->slug,
                'sections' => $course->sections,
            ],
            'lesson'           => $lessonData,
            'enrollment'       => [
                'id'               => $enrollment->id,
                'progress'         => $enrollment->progress_percentage,
                'completed_at'     => $enrollment->completed_at,
                'certificate_uuid' => $enrollment->certificate_uuid,
            ],
            'completedIds'     => $completedIds,
            'isCompleted'      => $isCompleted,
            'nextLesson'       => $next ? ['id' => $next->id, 'title' => $next->title] : null,
            'prevLesson'       => $prev ? ['id' => $prev->id, 'title' => $prev->title] : null,
            'lastAttempt'      => $lastAttempt,
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

        // Evaluate course completion based on certificate requirements
        $template     = $course->certificate_template ?? \App\Models\Course::defaultCertificateTemplate();
        $requirements = $template['requirements'] ?? ['type' => 'all_lessons'];
        $reqType      = $requirements['type'] ?? 'all_lessons';

        $total          = $course->lessons()->count();
        $completedCount = $enrollment->lessonProgress()->whereNotNull('completed_at')->count();

        $isComplete = match ($reqType) {
            'percentage' => (function () use ($requirements, $total, $completedCount) {
                $pct    = max(1, min(100, (int) ($requirements['percentage'] ?? 100)));
                $needed = (int) ceil(($pct / 100) * $total);
                return $total > 0 && $completedCount >= $needed;
            })(),
            'specific_sections' => (function () use ($requirements, $enrollment) {
                $ids = $requirements['section_ids'] ?? [];
                if (empty($ids)) return false;
                $required  = \App\Models\Lesson::whereIn('section_id', $ids)->pluck('id');
                $completed = $enrollment->lessonProgress()
                    ->whereNotNull('completed_at')
                    ->whereIn('lesson_id', $required)
                    ->count();
                return $required->count() > 0 && $completed >= $required->count();
            })(),
            'specific_lessons' => (function () use ($requirements, $enrollment) {
                $ids = $requirements['lesson_ids'] ?? [];
                if (empty($ids)) return false;
                $completed = $enrollment->lessonProgress()
                    ->whereNotNull('completed_at')
                    ->whereIn('lesson_id', $ids)
                    ->count();
                return count($ids) > 0 && $completed >= count($ids);
            })(),
            default => $total > 0 && $completedCount >= $total, // all_lessons
        };

        if ($isComplete && !$enrollment->completed_at) {
            $enrollment->update([
                'completed_at'     => now(),
                'certificate_uuid' => ($template['enabled'] ?? true) ? (string) Str::uuid() : null,
            ]);
        }

        return back()->with('success', 'Lesson marked complete.');
    }

    public function submitQuiz(Request $request, Course $course, Lesson $lesson): RedirectResponse
    {
        abort_unless($lesson->type === 'quiz', 422);

        $enrollment = $request->user()->enrollments()
            ->where('course_id', $course->id)
            ->firstOrFail();

        $request->validate([
            'answers'   => 'required|array',
            'answers.*' => 'nullable|integer',
        ]);

        $quizData     = json_decode($lesson->content ?? '{}', true) ?? [];
        $questions    = $quizData['questions'] ?? [];
        $passingScore = (int) ($quizData['passing_score'] ?? 70);
        $answers      = $request->input('answers', []);

        $correct   = 0;
        $total     = count($questions);
        $results   = [];

        foreach ($questions as $i => $question) {
            $selected  = isset($answers[$i]) ? (int) $answers[$i] : null;
            $isCorrect = $selected !== null && $selected === (int) $question['correct'];
            if ($isCorrect) $correct++;

            $results[] = [
                'text'       => $question['text']    ?? '',
                'type'       => $question['type']    ?? 'text',
                'options'    => $question['options'] ?? [],
                'selected'   => $selected,
                'correct'    => (int) $question['correct'],
                'is_correct' => $isCorrect,
            ];
        }

        $percentage = $total > 0 ? (int) round(($correct / $total) * 100) : 0;
        $passed     = $percentage >= $passingScore;

        QuizAttempt::create([
            'user_id'       => $request->user()->id,
            'lesson_id'     => $lesson->id,
            'enrollment_id' => $enrollment->id,
            'answers'       => $answers,
            'score'         => $correct,
            'max_score'     => $total,
            'passed'        => $passed,
        ]);

        // If passed, mark lesson complete using existing completion logic
        if ($passed) {
            LessonProgress::updateOrCreate(
                ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
                ['enrollment_id' => $enrollment->id, 'completed_at' => now()]
            );

            $template     = $course->certificate_template ?? \App\Models\Course::defaultCertificateTemplate();
            $requirements = $template['requirements'] ?? ['type' => 'all_lessons'];
            $reqType      = $requirements['type'] ?? 'all_lessons';
            $totalLessons = $course->lessons()->count();
            $completedCount = $enrollment->lessonProgress()->whereNotNull('completed_at')->count();

            $isComplete = match ($reqType) {
                'percentage' => (function () use ($requirements, $totalLessons, $completedCount) {
                    $pct    = max(1, min(100, (int) ($requirements['percentage'] ?? 100)));
                    $needed = (int) ceil(($pct / 100) * $totalLessons);
                    return $totalLessons > 0 && $completedCount >= $needed;
                })(),
                'specific_sections' => (function () use ($requirements, $enrollment) {
                    $ids      = $requirements['section_ids'] ?? [];
                    $required = \App\Models\Lesson::whereIn('section_id', $ids)->pluck('id');
                    $done     = $enrollment->lessonProgress()->whereNotNull('completed_at')->whereIn('lesson_id', $required)->count();
                    return $required->count() > 0 && $done >= $required->count();
                })(),
                'specific_lessons' => (function () use ($requirements, $enrollment) {
                    $ids  = $requirements['lesson_ids'] ?? [];
                    $done = $enrollment->lessonProgress()->whereNotNull('completed_at')->whereIn('lesson_id', $ids)->count();
                    return count($ids) > 0 && $done >= count($ids);
                })(),
                default => $totalLessons > 0 && $completedCount >= $totalLessons,
            };

            if ($isComplete && !$enrollment->completed_at) {
                $enrollment->update([
                    'completed_at'     => now(),
                    'certificate_uuid' => ($template['enabled'] ?? true) ? (string) Str::uuid() : null,
                ]);
            }
        }

        return back()->with('quiz_result', [
            'score'         => $correct,
            'max_score'     => $total,
            'percentage'    => $percentage,
            'passed'        => $passed,
            'passing_score' => $passingScore,
            'results'       => $results,
        ]);
    }
}
