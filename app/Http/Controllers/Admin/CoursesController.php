<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomFont;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class CoursesController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();

        $courses = Course::with('creator:id,name')
            ->when($user?->isCourseViewer(), function ($q) use ($user) {
                $q->whereIn('id', $user->permittedCourses()->select('courses.id'));
            })
            ->withCount(['lessons', 'enrollments'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        $this->authorizeCourseManagement(request());

        return Inertia::render('Admin/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'title_ms'         => 'nullable|string|max:255',
            'slug'             => 'nullable|string|max:255|unique:courses,slug',
            'description'      => 'nullable|string',
            'description_ms'   => 'nullable|string',
            'cover_image'      => 'nullable|string|max:500',
            'cover_image_file' => 'nullable|file|image|max:5120',
            'category'         => 'nullable|string|max:100',
            'difficulty'       => 'required|in:beginner,intermediate,advanced',
        ]);

        if ($request->hasFile('cover_image_file')) {
            $path = $request->file('cover_image_file')->store('covers', 'public');
            $validated['cover_image'] = Storage::url($path);
        }
        unset($validated['cover_image_file']);

        $slug = $validated['slug'] ?? Str::slug($validated['title']);
        $base = $slug;
        $i = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $course = Course::create([
            ...$validated,
            'slug'       => $slug,
            'created_by' => $request->user()->id,
            'status'     => 'draft',
        ]);

        ActivityLogger::record('Created course', $course, [
            'title' => $course->title,
            'slug' => $course->slug,
            'difficulty' => $course->difficulty,
            'status' => $course->status,
        ], 'created');

        return redirect()->route('admin.courses.edit', $course)
            ->with('success', 'Course created. Now build your curriculum.');
    }

    public function edit(Course $course): Response
    {
        $this->authorizeCourseView(request(), $course);

        $course->load(['sections' => function ($q) {
            $q->orderBy('order')->with(['lessons' => function ($q2) {
                $q2->orderBy('order')->select(['id', 'section_id', 'title', 'type', 'order']);
            }]);
        }]);

        // ── Analytics ──────────────────────────────────────────────────────────
        $totalLessons      = $course->lessons()->count();
        $totalEnrollments  = $course->enrollments()->count();
        $completedCount    = $course->enrollments()->whereNotNull('completed_at')->count();
        $inProgressCount   = $totalEnrollments - $completedCount;
        $completionRate    = $totalEnrollments > 0
            ? round(($completedCount / $totalEnrollments) * 100, 1) : 0;
        $certIssuedCount   = $course->enrollments()->whereNotNull('certificate_uuid')->count();

        $avgProgress = 0;
        if ($totalEnrollments > 0 && $totalLessons > 0) {
            $enrollmentIds  = $course->enrollments()->pluck('id');
            $totalCompleted = LessonProgress::whereIn('enrollment_id', $enrollmentIds)
                ->whereNotNull('completed_at')
                ->count();
            $avgProgress = round(($totalCompleted / ($totalEnrollments * $totalLessons)) * 100, 1);
        }

        $analytics = [
            'total_enrollments'  => $totalEnrollments,
            'completed_count'    => $completedCount,
            'in_progress_count'  => $inProgressCount,
            'completion_rate'    => $completionRate,
            'avg_progress'       => $avgProgress,
            'total_lessons'      => $totalLessons,
            'cert_issued_count'  => $certIssuedCount,
        ];

        $lessonStats = $course->sections()
            ->orderBy('order')
            ->with(['lessons' => function ($q) {
                $q->orderBy('order')
                  ->withCount(['progress as completed_count' => fn($q2) => $q2->whereNotNull('completed_at')]);
            }])
            ->get()
            ->flatMap(fn($section) => $section->lessons->map(fn($lesson) => [
                'id'              => $lesson->id,
                'title'           => $lesson->title,
                'type'            => $lesson->type,
                'section'         => $section->title,
                'completed_count' => $lesson->completed_count,
                'completion_rate' => $totalEnrollments > 0
                    ? round(($lesson->completed_count / $totalEnrollments) * 100, 1) : 0,
            ]))
            ->values();

        $students = $course->enrollments()
            ->with([
                'user:id,name,email,avatar,gender,race,state,birthdate,occupation,organization',
                'lessonProgress' => fn($q) => $q->whereNotNull('completed_at')
                    ->select('enrollment_id', 'lesson_id', 'completed_at'),
            ])
            ->latest('enrolled_at')
            ->get()
            ->filter(fn($enrollment) => $enrollment->user !== null)
            ->map(fn($enrollment) => [
                'id'                   => $enrollment->id,
                'user_id'              => $enrollment->user?->id,
                'user_name'            => $enrollment->user?->name,
                'user_email'           => $enrollment->user?->email,
                'user_avatar'          => $enrollment->user?->avatar,
                'user_gender'          => $enrollment->user?->gender,
                'user_race'            => $enrollment->user?->race,
                'user_state'           => $enrollment->user?->state,
                'user_birthdate'       => $enrollment->user?->birthdate?->format('M j, Y'),
                'user_birthdate_raw'   => $enrollment->user?->birthdate?->format('Y-m-d'),
                'user_occupation'      => $enrollment->user?->occupation,
                'user_organization'    => $enrollment->user?->organization,
                'enrolled_at'          => $enrollment->enrolled_at?->format('M j, Y'),
                'enrolled_at_raw'      => $enrollment->enrolled_at?->toDateString(),
                'completed_at'         => $enrollment->completed_at?->format('M j, Y'),
                'completed_at_raw'     => $enrollment->completed_at?->toDateString(),
                'progress'             => $totalLessons > 0
                    ? (int) round(($enrollment->lessonProgress->count() / $totalLessons) * 100) : 0,
                'certificate_uuid'     => $enrollment->certificate_uuid,
                'completed_lesson_ids' => $enrollment->lessonProgress->pluck('lesson_id')->all(),
                'last_activity'        => $enrollment->lessonProgress->max('completed_at')
                    ? \Carbon\Carbon::parse($enrollment->lessonProgress->max('completed_at'))->format('M j, Y')
                    : null,
            ]);

        $learnerActivityFeed = Activity::query()
            ->where('log_name', 'learner_course')
            ->where('properties->course_id', $course->id)
            ->with('causer:id,name,email')
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
                    'learner' => [
                        'id' => $activity->causer?->id,
                        'name' => $activity->causer?->name ?? 'Unknown',
                        'email' => $activity->causer?->email,
                    ],
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
            ->values();

        $quizLessons = Lesson::query()
            ->where('type', 'quiz')
            ->whereHas('section', fn($q) => $q->where('course_id', $course->id))
            ->with('section:id,title')
            ->get(['id', 'section_id', 'title', 'content']);

        $quizLessonIds = $quizLessons->pluck('id');

        $quizAttempts = $quizLessonIds->isNotEmpty()
            ? QuizAttempt::query()
                ->whereIn('lesson_id', $quizLessonIds)
                ->get(['lesson_id', 'user_id', 'attempt_number', 'answers', 'score', 'max_score', 'passed', 'created_at'])
            : collect();

        $totalAttempts = $quizAttempts->count();
        $passedAttempts = $quizAttempts->where('passed', true)->count();
        $failedAttempts = $totalAttempts - $passedAttempts;
        $avgPercentage = $totalAttempts > 0
            ? round($quizAttempts->avg(function ($attempt) {
                return $attempt->max_score > 0
                    ? (($attempt->score / $attempt->max_score) * 100)
                    : 0;
            }), 1)
            : 0;

        $attemptPercentages = $quizAttempts
            ->map(function ($attempt) {
                return $attempt->max_score > 0
                    ? (($attempt->score / $attempt->max_score) * 100)
                    : 0;
            })
            ->sort()
            ->values();

        $medianPercentage = 0;
        if ($attemptPercentages->isNotEmpty()) {
            $count = $attemptPercentages->count();
            $mid = intdiv($count, 2);

            $medianPercentage = $count % 2 === 0
                ? round((($attemptPercentages[$mid - 1] + $attemptPercentages[$mid]) / 2), 1)
                : round($attemptPercentages[$mid], 1);
        }

        $scoreDistribution = [
            '0_39' => 0,
            '40_59' => 0,
            '60_79' => 0,
            '80_100' => 0,
        ];

        foreach ($attemptPercentages as $pct) {
            if ($pct < 40) {
                $scoreDistribution['0_39']++;
            } elseif ($pct < 60) {
                $scoreDistribution['40_59']++;
            } elseif ($pct < 80) {
                $scoreDistribution['60_79']++;
            } else {
                $scoreDistribution['80_100']++;
            }
        }

        $firstAttempts = $quizAttempts->where('attempt_number', 1)->values();
        $firstAttemptCount = $firstAttempts->count();
        $firstAttemptPassed = $firstAttempts->where('passed', true)->count();

        $perQuiz = $quizLessons->map(function ($lesson) use ($quizAttempts) {
            $attempts = $quizAttempts->where('lesson_id', $lesson->id)->values();
            $attemptCount = $attempts->count();
            $passedCount = $attempts->where('passed', true)->count();
            $failedCount = $attemptCount - $passedCount;
            $firstAttempts = $attempts->where('attempt_number', 1)->values();
            $firstAttemptCount = $firstAttempts->count();
            $firstAttemptPassed = $firstAttempts->where('passed', true)->count();
            $avgPct = $attemptCount > 0
                ? round($attempts->avg(function ($attempt) {
                    return $attempt->max_score > 0
                        ? (($attempt->score / $attempt->max_score) * 100)
                        : 0;
                }), 1)
                : 0;

            return [
                'lesson_id' => $lesson->id,
                'lesson_title' => $lesson->title,
                'section_title' => $lesson->section?->title,
                'attempts' => $attemptCount,
                'passed' => $passedCount,
                'failed' => $failedCount,
                'pass_rate' => $attemptCount > 0 ? round(($passedCount / $attemptCount) * 100, 1) : 0,
                'first_attempt_pass_rate' => $firstAttemptCount > 0 ? round(($firstAttemptPassed / $firstAttemptCount) * 100, 1) : 0,
                'avg_score_pct' => $avgPct,
            ];
        })->values();

        $perQuestion = $quizLessons->flatMap(function ($lesson) use ($quizAttempts) {
            $content = is_array($lesson->content)
                ? $lesson->content
                : (json_decode($lesson->content ?? '{}', true) ?: []);
            $questions = $content['questions'] ?? [];
            $attempts = $quizAttempts->where('lesson_id', $lesson->id)->values();

            return collect($questions)->map(function ($question, $index) use ($lesson, $attempts) {
                $isMulti = !empty($question['multi_answer']);
                $options = is_array($question['options'] ?? null) ? $question['options'] : [];

                $correctValues = $isMulti
                    ? array_values(array_map('intval', (array) ($question['correct'] ?? [])))
                    : [(int) (is_array($question['correct'] ?? null) ? ($question['correct'][0] ?? -1) : ($question['correct'] ?? -1))];

                sort($correctValues);

                $answeredCount = 0;
                $correctCount = 0;
                $optionCounts = collect($options)->mapWithKeys(fn($_, $optIdx) => [$optIdx => 0])->all();
                $attemptsCount = $attempts->count();

                foreach ($attempts as $attempt) {
                    $answers = is_array($attempt->answers) ? $attempt->answers : [];
                    $selectedRaw = $answers[$index] ?? null;

                    if ($isMulti) {
                        $selected = is_array($selectedRaw) ? array_values(array_map('intval', $selectedRaw)) : [];
                        foreach ($selected as $sel) {
                            if (array_key_exists($sel, $optionCounts)) {
                                $optionCounts[$sel]++;
                            }
                        }

                        if (count($selected) > 0) {
                            $answeredCount++;
                            sort($selected);
                            if ($selected === $correctValues) {
                                $correctCount++;
                            }
                        }
                    } else {
                        $selected = is_array($selectedRaw) ? null : (is_null($selectedRaw) ? null : (int) $selectedRaw);
                        if (!is_null($selected)) {
                            $answeredCount++;
                            if (array_key_exists($selected, $optionCounts)) {
                                $optionCounts[$selected]++;
                            }
                            if ($selected === ($correctValues[0] ?? -1)) {
                                $correctCount++;
                            }
                        }
                    }
                }

                return [
                    'lesson_id' => $lesson->id,
                    'lesson_title' => $lesson->title,
                    'question_index' => $index + 1,
                    'question_text' => $question['text'] ?? 'Untitled question',
                    'question_type' => $question['type'] ?? 'text',
                    'is_multi_answer' => $isMulti,
                    'answered_count' => $answeredCount,
                    'correct_count' => $correctCount,
                    'incorrect_count' => max(0, $answeredCount - $correctCount),
                    'skip_count' => max(0, $attemptsCount - $answeredCount),
                    'skip_rate_pct' => $attemptsCount > 0 ? round(((max(0, $attemptsCount - $answeredCount) / $attemptsCount) * 100), 1) : 0,
                    'total_attempts' => $attemptsCount,
                    'accuracy_pct' => $answeredCount > 0 ? round(($correctCount / $answeredCount) * 100, 1) : 0,
                    'option_counts' => $optionCounts,
                    'options' => $options,
                ];
            });
        })->values();

        $hardestQuestions = $perQuestion
            ->filter(fn($q) => ($q['total_attempts'] ?? 0) > 0)
            ->sort(function ($a, $b) {
                if ($a['accuracy_pct'] !== $b['accuracy_pct']) {
                    return $a['accuracy_pct'] <=> $b['accuracy_pct'];
                }
                if ($a['skip_rate_pct'] !== $b['skip_rate_pct']) {
                    return $b['skip_rate_pct'] <=> $a['skip_rate_pct'];
                }
                return $b['total_attempts'] <=> $a['total_attempts'];
            })
            ->take(10)
            ->values();

        $quizAnalytics = [
            'overview' => [
                'quiz_count' => $quizLessons->count(),
                'attempts' => $totalAttempts,
                'passed' => $passedAttempts,
                'failed' => $failedAttempts,
                'pass_rate' => $totalAttempts > 0 ? round(($passedAttempts / $totalAttempts) * 100, 1) : 0,
                'first_attempts' => $firstAttemptCount,
                'first_passed' => $firstAttemptPassed,
                'first_attempt_pass_rate' => $firstAttemptCount > 0 ? round(($firstAttemptPassed / $firstAttemptCount) * 100, 1) : 0,
                'avg_score_pct' => $avgPercentage,
                'median_score_pct' => $medianPercentage,
                'score_distribution' => $scoreDistribution,
                'unique_learners' => $quizAttempts->pluck('user_id')->unique()->count(),
            ],
            'per_quiz' => $perQuiz,
            'per_question' => $perQuestion,
            'hardest_questions' => $hardestQuestions,
        ];

        return Inertia::render('Admin/Courses/Edit', [
            'course'          => $course,
            'defaultTemplate' => \App\Models\Course::defaultCertificateTemplate(),
            'customFonts'     => CustomFont::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'family', 'regular_path', 'bold_path', 'italic_path', 'bold_italic_path']),
            'analytics'       => $analytics,
            'students'        => $students,
            'lessonStats'     => $lessonStats,
            'learnerActivityFeed' => $learnerActivityFeed,
            'quizAnalytics'   => $quizAnalytics,
            'flash'           => session()->only(['success', 'error']),
        ]);
    }

    public function updateIntroduction(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $request->validate([
            'introduction'    => 'nullable|array',
            'introduction_ms' => 'nullable|array',
        ]);

        $course->update([
            'introduction'    => $request->input('introduction'),
            'introduction_ms' => $request->input('introduction_ms'),
        ]);

        ActivityLogger::record('Updated course introduction', $course, [
            'title' => $course->title,
            'updated_fields' => ['introduction', 'introduction_ms'],
        ], 'updated');

        return back()->with('success', 'Introduction saved.');
    }

    public function updateCertificate(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $validated = $request->validate([
            'certificate_template'                          => 'required|array',
            'certificate_template.enabled'                  => 'required|boolean',
            'certificate_template.size'                     => 'required|in:a4,letter',
            'certificate_template.orientation'              => 'required|in:landscape,portrait',
            'certificate_template.background'               => 'required|array',
            'certificate_template.background.type'          => 'required|in:color,image',
            'certificate_template.background.color'         => 'nullable|string|max:20',
            'certificate_template.background.image_url'     => 'nullable|string|max:1000',
            'certificate_template.branding'                 => 'required|array',
            'certificate_template.fields'                   => 'required|array',
            'certificate_template.signatory'                => 'required|array',
            'certificate_template.font_family'              => 'nullable|string|max:120',
            'certificate_template.custom_font_id'           => 'nullable|integer|exists:custom_fonts,id',
            'certificate_template.requirements'             => 'required|array',
            'certificate_template.requirements.type'        => 'required|in:all_lessons,percentage,specific_sections,specific_lessons',
            'certificate_template.requirements.percentage'  => 'nullable|integer|min:1|max:100',
            'certificate_template.requirements.section_ids' => 'nullable|array',
            'certificate_template.requirements.lesson_ids'  => 'nullable|array',
        ]);

        $course->update(['certificate_template' => $validated['certificate_template']]);

        ActivityLogger::record('Updated course certificate settings', $course, [
            'title' => $course->title,
            'updated_fields' => ['certificate_template'],
        ], 'updated');

        return back()->with('success', 'Certificate template saved.');
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'title_ms'         => 'nullable|string|max:255',
            'slug'             => ['nullable', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($course->id)],
            'description'      => 'nullable|string',
            'description_ms'   => 'nullable|string',
            'cover_image'      => 'nullable|string|max:500',
            'cover_image_file' => 'nullable|file|image|max:5120',
            'cover_image_clear'=> 'nullable|boolean',
            'category'         => 'nullable|string|max:100',
            'difficulty'       => 'required|in:beginner,intermediate,advanced',
            'status'           => 'required|in:draft,review,published',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_image'       => 'nullable|string|max:500',
        ]);

        if ($request->hasFile('cover_image_file')) {
            $this->deleteStoredFile($course->cover_image);
            $path = $request->file('cover_image_file')->store('covers', 'public');
            $validated['cover_image'] = Storage::url($path);
        } elseif ($request->boolean('cover_image_clear')) {
            $this->deleteStoredFile($course->cover_image);
            $validated['cover_image'] = null;
        }
        unset($validated['cover_image_file'], $validated['cover_image_clear']);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $before = $course->only(array_keys($validated));

        $course->update($validated);

        ActivityLogger::record('Updated course details', $course, [
            'title' => $course->title,
            'updated_fields' => ActivityLogger::changedFields($before, $course->only(array_keys($validated))),
        ], 'updated');

        return back()->with('success', 'Course details saved.');
    }

    public function duplicate(Course $course): RedirectResponse
    {
        $this->authorizeCourseManagement(request());

        $base = $course->slug . '-copy';
        $slug = $base;
        $i    = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $newCourse              = $course->replicate();
        $newCourse->title       = 'Copy of ' . $course->title;
        $newCourse->slug        = $slug;
        $newCourse->status      = 'draft';
        $newCourse->created_by  = request()->user()->id;
        $newCourse->save();

        foreach ($course->sections()->orderBy('order')->with(['lessons' => fn ($q) => $q->orderBy('order')])->get() as $section) {
            $newSection            = $section->replicate();
            $newSection->course_id = $newCourse->id;
            $newSection->save();

            foreach ($section->lessons as $lesson) {
                $newLesson             = $lesson->replicate();
                $newLesson->section_id = $newSection->id;
                $newLesson->save();
            }
        }

        ActivityLogger::record('Duplicated course', $newCourse, [
            'title' => $newCourse->title,
            'source_course_id' => $course->id,
        ], 'created');

        return redirect()->route('admin.courses.edit', $newCourse)
            ->with('success', 'Course duplicated. You are now editing the copy.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorizeCourseManagement(request());

        ActivityLogger::record('Deleted course', $course, [
            'title' => $course->title,
            'slug' => $course->slug,
        ], 'deleted');

        $this->deleteStoredFile($course->cover_image);
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted.');
    }

    private function deleteStoredFile(?string $url): void
    {
        if (!$url) return;
        if (str_contains($url, '/storage/')) {
            $path = preg_replace('#^.*/storage/#', '', $url);
            Storage::disk('public')->delete($path);
        }
    }

    private function authorizeCourseManagement(Request $request): void
    {
        if (!$request->user()?->canManageCourses()) {
            abort(403, 'Your role has view-only access to courses.');
        }
    }

    private function authorizeCourseView(Request $request, Course $course): void
    {
        if (!$request->user()?->canViewCourse($course)) {
            abort(403, 'You are not permitted to access this course.');
        }
    }
}
