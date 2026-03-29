<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\QuizAttempt;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $courses = Course::query()
            ->when($user?->isCourseViewer(), function ($q) use ($user) {
                $q->whereIn('id', $user->permittedCourses()->select('courses.id'));
            })
            ->withCount('enrollments')
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'status', 'difficulty', 'enrollments_count']);

        $requestedCourseId = $request->integer('course_id');
        $selectedCourse = $requestedCourseId
            ? $courses->firstWhere('id', $requestedCourseId)
            : $courses->first();

        $selectedCourseId = $selectedCourse?->id;
        $selectedCourseDetails = $selectedCourseId
            ? Course::query()
                ->where('id', $selectedCourseId)
                ->with(['sections' => function ($q) {
                    $q->orderBy('order')->with(['lessons' => fn($lq) => $lq->orderBy('order')->select(['id', 'section_id', 'title', 'type'])]);
                }])
                ->first()
            : null;

        $dateTo   = $request->input('date_to',   now()->toDateString());
        $dateFrom = $request->input('date_from', now()->subDays(29)->toDateString());

        $filters = [
            'course_id'  => $selectedCourseId,
            'date_from'  => $dateFrom,
            'date_to'    => $dateTo,
            'gender'     => $this->normalizeFilterValues($request->input('gender', [])),
            'race'       => $this->normalizeFilterValues($request->input('race', [])),
            'state'      => $this->normalizeFilterValues($request->input('state', [])),
            'occupation' => $this->normalizeFilterValues($request->input('occupation', [])),
            'organization' => $this->normalizeFilterValues($request->input('organization', [])),
            'age_group'  => $this->normalizeFilterValues($request->input('age_group', [])),
        ];

        $analytics = $selectedCourseDetails
            ? array_merge($this->buildAnalytics($selectedCourseDetails, $filters), [
                'learners' => $this->buildLearnersForDashboard($selectedCourseDetails, $filters),
            ])
            : null;

        return Inertia::render('Admin/Analytics/Index', [
            'courses'        => $courses,
            'selectedCourse' => $selectedCourseDetails ? [
                'id'       => $selectedCourseDetails->id,
                'title'    => $selectedCourseDetails->title,
                'slug'     => $selectedCourseDetails->slug,
                'sections' => $selectedCourseDetails->sections->map(fn($section) => [
                    'id'      => $section->id,
                    'title'   => $section->title,
                    'lessons' => $section->lessons->map(fn($lesson) => [
                        'id'    => $lesson->id,
                        'title' => $lesson->title,
                        'type'  => $lesson->type,
                    ])->values(),
                ])->values(),
            ] : null,
            'analytics' => $analytics,
            'filters'   => $filters,
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $course = $this->resolveCourseForUser($request);

        if (! $course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $filters = $this->collectFilters($request, $course->id);

        return response()->json($this->buildAnalytics($course, $filters));
    }

    public function export(Request $request): StreamedResponse
    {
        $course = $this->resolveCourseForUser($request);

        abort_unless($course, 404, 'Course not found');

        $filters = $this->collectFilters($request, $course->id);

        $analytics = $this->buildAnalytics($course, $filters);
        $learners = $this->buildLearnersForExport($course, $filters);

        $filename = sprintf(
            'course-analytics-%s-%s.csv',
            $course->slug ?: $course->id,
            now()->format('Ymd-His')
        );

        return response()->streamDownload(function () use ($course, $filters, $analytics, $learners) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM to improve Excel compatibility on Windows.
            fwrite($handle, "\xEF\xBB\xBF");

            // Metadata rows
            fputcsv($handle, ['generated_at', now()->toIso8601String()]);
            fputcsv($handle, ['course_id', $course->id]);
            fputcsv($handle, ['course_title', $course->title]);
            fputcsv($handle, ['course_slug', $course->slug]);
            fputcsv($handle, []);

            fputcsv($handle, ['applied_filters']);
            foreach ($filters as $key => $value) {
                fputcsv($handle, [$key, is_array($value) ? implode(', ', $value) : (string) $value]);
            }
            fputcsv($handle, []);

            fputcsv($handle, ['summary_metrics']);
            foreach ($analytics['summary'] as $metric => $value) {
                fputcsv($handle, [$metric, (string) $value]);
            }
            fputcsv($handle, []);

            // Learner export table (profile + achievements)
            fputcsv($handle, [
                'enrollment_id',
                'user_id',
                'name',
                'email',
                'gender',
                'race',
                'state',
                'birthdate',
                'occupation',
                'organization',
                'enrolled_at',
                'completed_at',
                'completion_status',
                'certificate_uuid',
                'completed_lessons',
                'total_lessons',
                'progress_percent',
                'quiz_attempts_count',
                'quizzes_passed_count',
                'avg_quiz_score_percent',
            ]);

            foreach ($learners as $learner) {
                $achievements = $learner['achievements'] ?? [];

                fputcsv($handle, [
                    $learner['enrollment_id'] ?? '',
                    $learner['user_id'] ?? '',
                    $learner['name'] ?? '',
                    $learner['email'] ?? '',
                    $learner['gender'] ?? '',
                    $learner['race'] ?? '',
                    $learner['state'] ?? '',
                    $learner['birthdate'] ?? '',
                    $learner['occupation'] ?? '',
                    $learner['organization'] ?? '',
                    $achievements['enrolled_at'] ?? '',
                    $achievements['completed_at'] ?? '',
                    $achievements['completion_status'] ?? '',
                    $achievements['certificate_uuid'] ?? '',
                    $achievements['completed_lessons'] ?? 0,
                    $achievements['total_lessons'] ?? 0,
                    $achievements['progress_percent'] ?? 0,
                    $achievements['quiz_attempts_count'] ?? 0,
                    $achievements['quizzes_passed_count'] ?? 0,
                    $achievements['avg_quiz_score_percent'] ?? 0,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Core analytics builder
    // ────────────────────────────────────────────────────────────────────────────

    private function buildAnalytics(Course $course, array $filters): array
    {
        $dateFrom = Carbon::parse($filters['date_from'])->startOfDay();
        $dateTo   = Carbon::parse($filters['date_to'])->endOfDay();

        // Base enrollment query (scoped to demographic filters)
        $enrollmentBase = $this->baseEnrollmentQuery($course, $filters);

        $totalEnrollments = (clone $enrollmentBase)->count();
        $totalCompletions = (clone $enrollmentBase)->whereNotNull('enrollments.completed_at')->count();
        $completionRate   = $totalEnrollments > 0
            ? round(($totalCompletions / $totalEnrollments) * 100, 1) : 0;

        $totalLessons = $course->lessons()->count();

        // Average progress
        $avgProgress = 0;
        if ($totalEnrollments > 0 && $totalLessons > 0) {
            $enrollmentIds = (clone $enrollmentBase)->pluck('enrollments.id');
            $completedLessons = LessonProgress::whereIn('enrollment_id', $enrollmentIds)
                ->whereNotNull('completed_at')
                ->count();
            $avgProgress = round(($completedLessons / ($totalEnrollments * $totalLessons)) * 100, 1);
        }

        // Average quiz score
        $enrollmentIds = (clone $enrollmentBase)->pluck('enrollments.id');
        $quizAttempts  = QuizAttempt::whereIn('enrollment_id', $enrollmentIds)->get(['score', 'max_score']);
        $avgQuizScore  = $quizAttempts->count() > 0
            ? round($quizAttempts->avg(fn($a) => $a->max_score > 0 ? ($a->score / $a->max_score * 100) : 0), 1)
            : 0;

        // ── Trends ────────────────────────────────────────────────────────────

        $enrollmentTrend = Enrollment::query()
            ->where('course_id', $course->id)
            ->join('users', 'users.id', '=', 'enrollments.user_id')
            ->whereBetween('enrollments.enrolled_at', [$dateFrom, $dateTo])
            ->tap(fn($query) => $this->applyDemographicFilters($query, $filters))
            ->selectRaw('DATE(enrollments.enrolled_at) as date, COUNT(*) as count')
            ->groupByRaw('DATE(enrollments.enrolled_at)')
            ->orderBy('date')
            ->get()
            ->keyBy('date')
            ->map(fn($r) => (int) $r->count);

        $completionTrend = Enrollment::query()
            ->where('course_id', $course->id)
            ->join('users', 'users.id', '=', 'enrollments.user_id')
            ->whereNotNull('enrollments.completed_at')
            ->whereBetween('enrollments.completed_at', [$dateFrom, $dateTo])
            ->tap(fn($query) => $this->applyDemographicFilters($query, $filters))
            ->selectRaw('DATE(enrollments.completed_at) as date, COUNT(*) as count')
            ->groupByRaw('DATE(enrollments.completed_at)')
            ->orderBy('date')
            ->get()
            ->keyBy('date')
            ->map(fn($r) => (int) $r->count);

        // Build a full date range array
        $trend = [];
        $current = $dateFrom->copy();
        while ($current->lte($dateTo)) {
            $d = $current->toDateString();
            $trend[] = [
                'date'        => $d,
                'enrollments' => $enrollmentTrend[$d] ?? 0,
                'completions' => $completionTrend[$d] ?? 0,
            ];
            $current->addDay();
        }

        // ── Lesson funnel ─────────────────────────────────────────────────────

        $lessonFunnel = $course->sections()
            ->orderBy('order')
            ->with(['lessons' => function ($q) use ($enrollmentIds) {
                $q->orderBy('order')
                  ->withCount(['progress as completed_count' => function ($q2) use ($enrollmentIds) {
                      $q2->whereIn('enrollment_id', $enrollmentIds)
                         ->whereNotNull('completed_at');
                  }]);
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
            ->values()
            ->all();

        // ── Quiz stats per lesson ─────────────────────────────────────────────

        $quizLessons = Lesson::query()
            ->where('type', 'quiz')
            ->whereHas('section', fn($q) => $q->where('course_id', $course->id))
            ->with('section:id,title')
            ->get(['id', 'section_id', 'title']);

        $quizLessonIds = $quizLessons->pluck('id');

        $allQuizAttempts = $quizLessonIds->isNotEmpty()
            ? QuizAttempt::whereIn('lesson_id', $quizLessonIds)
                ->whereIn('enrollment_id', $enrollmentIds)
                ->get(['lesson_id', 'user_id', 'attempt_number', 'score', 'max_score', 'passed'])
            : collect();

        $quizStats = $quizLessons->map(function ($lesson) use ($allQuizAttempts, $totalEnrollments) {
            $attempts     = $allQuizAttempts->where('lesson_id', $lesson->id)->values();
            $attemptCount = $attempts->count();
            $passedCount  = $attempts->where('passed', true)->count();
            $avgPct = $attemptCount > 0
                ? round($attempts->avg(fn($a) => $a->max_score > 0 ? ($a->score / $a->max_score * 100) : 0), 1)
                : 0;

            return [
                'lesson_id'   => $lesson->id,
                'title'       => $lesson->title,
                'section'     => $lesson->section->title,
                'attempts'    => $attemptCount,
                'pass_rate'   => $attemptCount > 0 ? round($passedCount / $attemptCount * 100, 1) : 0,
                'avg_score'   => $avgPct,
            ];
        })->values()->all();

        // ── Demographics ──────────────────────────────────────────────────────

        $demographicBase = Enrollment::query()
            ->where('enrollments.course_id', $course->id)
            ->join('users', 'users.id', '=', 'enrollments.user_id')
            ->tap(fn($query) => $this->applyDemographicFilters($query, $filters));

        $byGender = (clone $demographicBase)
            ->selectRaw('COALESCE(NULLIF(users.gender, ""), "unknown") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => ucfirst($r->label), 'count' => (int) $r->count])
            ->values()->all();

        $byRace = (clone $demographicBase)
            ->selectRaw('COALESCE(NULLIF(users.race, ""), "unknown") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => [
                'label' => $this->formatRace($r->label),
                'count' => (int) $r->count,
            ])
            ->values()->all();

        $byState = (clone $demographicBase)
            ->selectRaw('COALESCE(NULLIF(users.state, ""), "Unknown") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => $r->label, 'count' => (int) $r->count])
            ->values()->all();

        $byOccupation = (clone $demographicBase)
            ->selectRaw('COALESCE(NULLIF(users.occupation, ""), "unknown") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => [
                'label' => $this->formatOccupation($r->label),
                'count' => (int) $r->count,
            ])
            ->values()->all();

        $byAgeGroup = (clone $demographicBase)
            ->selectRaw("
                CASE
                    WHEN users.birthdate IS NULL THEN 'Unknown'
                    WHEN TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) < 18 THEN 'Under 18'
                    WHEN TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 18 AND 24 THEN '18–24'
                    WHEN TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 25 AND 34 THEN '25–34'
                    WHEN TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 35 AND 44 THEN '35–44'
                    WHEN TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 45 AND 54 THEN '45–54'
                    ELSE '55+'
                END as label,
                COUNT(*) as count
            ")
            ->groupBy('label')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => ['label' => $r->label, 'count' => (int) $r->count])
            ->values()->all();

        return [
            'summary' => [
                'total_enrollments' => $totalEnrollments,
                'total_completions' => $totalCompletions,
                'completion_rate'   => $completionRate,
                'avg_progress'      => $avgProgress,
                'avg_quiz_score'    => $avgQuizScore,
                'total_lessons'     => $totalLessons,
            ],
            'trend'       => $trend,
            'lessonFunnel' => $lessonFunnel,
            'quizStats'    => $quizStats,
            'demographics' => [
                'by_gender'     => $byGender,
                'by_race'       => $byRace,
                'by_state'      => $byState,
                'by_occupation' => $byOccupation,
                'by_age_group'  => $byAgeGroup,
            ],
        ];
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private function applyAgeFilter($query, string $ageGroup)
    {
        return match ($ageGroup) {
            'under_18' => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) < 18'),
            '18_24'    => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 18 AND 24'),
            '25_34'    => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 25 AND 34'),
            '35_44'    => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 35 AND 44'),
            '45_54'    => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 45 AND 54'),
            '55_plus'  => $query->whereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) >= 55'),
            default    => $query,
        };
    }

    private function applyAgeGroupFilters($query, array $ageGroups)
    {
        if ($ageGroups === []) {
            return $query;
        }

        return $query->where(function ($nested) use ($ageGroups) {
            foreach ($ageGroups as $ageGroup) {
                match ($ageGroup) {
                    'under_18' => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) < 18'),
                    '18_24'    => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 18 AND 24'),
                    '25_34'    => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 25 AND 34'),
                    '35_44'    => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 35 AND 44'),
                    '45_54'    => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) BETWEEN 45 AND 54'),
                    '55_plus'  => $nested->orWhereRaw('TIMESTAMPDIFF(YEAR, users.birthdate, CURDATE()) >= 55'),
                    default    => null,
                };
            }
        });
    }

    private function applyDemographicFilters($query, array $filters)
    {
        $query
            ->when($filters['gender'] ?? [], fn($q, $values) => $q->whereIn('users.gender', $values))
            ->when($filters['race'] ?? [], fn($q, $values) => $q->whereIn('users.race', $values))
            ->when($filters['state'] ?? [], fn($q, $values) => $q->whereIn('users.state', $values))
            ->when($filters['occupation'] ?? [], fn($q, $values) => $q->whereIn('users.occupation', $values))
            ->when($filters['organization'] ?? [], fn($q, $values) => $q->whereIn('users.organization', $values));

        if (!empty($filters['age_group'])) {
            $this->applyAgeGroupFilters($query, $filters['age_group']);
        }

        return $query;
    }

    private function formatRace(string $value): string
    {
        return match ($value) {
            'malay'            => 'Malay',
            'chinese'          => 'Chinese',
            'indian'           => 'Indian',
            'other_bumiputera' => 'Other Bumiputera',
            'other'            => 'Other',
            default            => ucfirst($value),
        };
    }

    private function formatOccupation(string $value): string
    {
        return match ($value) {
            'student'       => 'Student',
            'government'    => 'Government',
            'private'       => 'Private Sector',
            'self_employed' => 'Self-employed',
            'professional'  => 'Professional',
            'academic'      => 'Academic',
            'homemaker'     => 'Homemaker',
            'retired'       => 'Retired',
            'unemployed'    => 'Unemployed',
            default         => ucfirst($value),
        };
    }

    private function collectFilters(Request $request, int $courseId): array
    {
        return [
            'course_id'  => $courseId,
            'date_from'  => $request->input('date_from', now()->subDays(29)->toDateString()),
            'date_to'    => $request->input('date_to', now()->toDateString()),
            'gender'     => $this->normalizeFilterValues($request->input('gender', [])),
            'race'       => $this->normalizeFilterValues($request->input('race', [])),
            'state'      => $this->normalizeFilterValues($request->input('state', [])),
            'occupation' => $this->normalizeFilterValues($request->input('occupation', [])),
            'organization' => $this->normalizeFilterValues($request->input('organization', [])),
            'age_group'  => $this->normalizeFilterValues($request->input('age_group', [])),
        ];
    }

    private function normalizeFilterValues(mixed $values): array
    {
        $items = is_array($values) ? $values : [$values];

        return collect($items)
            ->map(fn($value) => trim((string) $value))
            ->filter()
            ->values()
            ->all();
    }

    private function resolveCourseForUser(Request $request): ?Course
    {
        $user = auth()->user();
        $courseId = $request->integer('course_id');
        $course = Course::find($courseId);

        if (! $course) {
            return null;
        }

        if ($user?->isCourseViewer()) {
            $permitted = $user->permittedCourses()->pluck('courses.id');
            abort_unless($permitted->contains($course->id), 403, 'Forbidden');
        }

        return $course;
    }

    private function baseEnrollmentQuery(Course $course, array $filters)
    {
        return Enrollment::query()
            ->where('course_id', $course->id)
            ->join('users', 'users.id', '=', 'enrollments.user_id')
            ->select('enrollments.*')
            ->tap(fn($query) => $this->applyDemographicFilters($query, $filters));
    }

    private function buildLearnersForExport(Course $course, array $filters): array
    {
        $dateFrom = Carbon::parse($filters['date_from'])->startOfDay();
        $dateTo = Carbon::parse($filters['date_to'])->endOfDay();

        $totalLessons = $course->lessons()->count();
        $enrollmentIds = $this->baseEnrollmentQuery($course, $filters)
            ->whereBetween('enrollments.enrolled_at', [$dateFrom, $dateTo])
            ->pluck('enrollments.id');

        if ($enrollmentIds->isEmpty()) {
            return [];
        }

        $progressByEnrollment = LessonProgress::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->whereNotNull('completed_at')
            ->selectRaw('enrollment_id, COUNT(*) as completed_lessons')
            ->groupBy('enrollment_id')
            ->pluck('completed_lessons', 'enrollment_id');

        $quizByEnrollment = QuizAttempt::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->selectRaw('enrollment_id, COUNT(*) as attempts_count, SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed_count')
            ->groupBy('enrollment_id')
            ->get()
            ->keyBy('enrollment_id');

        $quizAvgByEnrollment = QuizAttempt::query()
            ->whereIn('enrollment_id', $enrollmentIds)
            ->get(['enrollment_id', 'score', 'max_score'])
            ->groupBy('enrollment_id')
            ->map(function ($attempts) {
                return round($attempts->avg(fn($a) => $a->max_score > 0 ? ($a->score / $a->max_score * 100) : 0), 1);
            });

        return Enrollment::query()
            ->whereIn('id', $enrollmentIds)
            ->with('user:id,name,email,gender,race,state,birthdate,occupation,organization')
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(function (Enrollment $enrollment) use ($progressByEnrollment, $quizByEnrollment, $quizAvgByEnrollment, $totalLessons) {
                $completedLessons = (int) ($progressByEnrollment[$enrollment->id] ?? 0);
                $progressPercent = $totalLessons > 0
                    ? round(($completedLessons / $totalLessons) * 100, 1)
                    : 0;

                $quizStats = $quizByEnrollment[$enrollment->id] ?? null;

                return [
                    'enrollment_id' => $enrollment->id,
                    'user_id' => $enrollment->user?->id,
                    'name' => $enrollment->user?->name,
                    'email' => $enrollment->user?->email,
                    'gender' => $enrollment->user?->gender,
                    'race' => $enrollment->user?->race,
                    'state' => $enrollment->user?->state,
                    'birthdate' => $enrollment->user?->birthdate?->toDateString(),
                    'occupation' => $enrollment->user?->occupation,
                    'organization' => $enrollment->user?->organization,
                    'achievements' => [
                        'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                        'completed_at' => $enrollment->completed_at?->toIso8601String(),
                        'completion_status' => $enrollment->completed_at ? 'completed' : 'in_progress',
                        'certificate_uuid' => $enrollment->certificate_uuid,
                        'completed_lessons' => $completedLessons,
                        'total_lessons' => $totalLessons,
                        'progress_percent' => $progressPercent,
                        'quiz_attempts_count' => (int) ($quizStats?->attempts_count ?? 0),
                        'quizzes_passed_count' => (int) ($quizStats?->passed_count ?? 0),
                        'avg_quiz_score_percent' => (float) ($quizAvgByEnrollment[$enrollment->id] ?? 0),
                    ],
                ];
            })
            ->values()
            ->all();
    }

    private function buildLearnersForDashboard(Course $course, array $filters): array
    {
        $dateFrom = Carbon::parse($filters['date_from'])->startOfDay();
        $dateTo = Carbon::parse($filters['date_to'])->endOfDay();

        $totalLessons = $course->lessons()->count();
        $enrollmentIds = $this->baseEnrollmentQuery($course, $filters)
            ->whereBetween('enrollments.enrolled_at', [$dateFrom, $dateTo])
            ->pluck('enrollments.id');

        if ($enrollmentIds->isEmpty()) {
            return [];
        }

        return Enrollment::query()
            ->whereIn('id', $enrollmentIds)
            ->with([
                'user:id,name,email,avatar,gender,race,state,birthdate,occupation,organization',
                'lessonProgress' => fn($q) => $q->whereNotNull('completed_at')
                    ->select('enrollment_id', 'lesson_id', 'completed_at'),
            ])
            ->latest('enrolled_at')
            ->get()
            ->map(function (Enrollment $enrollment) use ($totalLessons) {
                $completedCount = $enrollment->lessonProgress->count();

                return [
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
                        ? (int) round(($completedCount / $totalLessons) * 100) : 0,
                    'certificate_uuid'     => $enrollment->certificate_uuid,
                    'completed_lesson_ids' => $enrollment->lessonProgress->pluck('lesson_id')->all(),
                    'last_activity'        => $enrollment->lessonProgress->max('completed_at')
                        ? Carbon::parse($enrollment->lessonProgress->max('completed_at'))->format('M j, Y')
                        : null,
                ];
            })
            ->values()
            ->all();
    }
}
