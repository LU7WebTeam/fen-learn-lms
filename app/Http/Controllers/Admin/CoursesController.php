<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CoursesController extends Controller
{
    public function index(): Response
    {
        $courses = Course::with('creator:id,name')
            ->withCount(['lessons', 'enrollments'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'slug'        => 'nullable|string|max:255|unique:courses,slug',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|url|max:500',
            'category'    => 'nullable|string|max:100',
            'difficulty'  => 'required|in:beginner,intermediate,advanced',
        ]);

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

        return redirect()->route('admin.courses.edit', $course)
            ->with('success', 'Course created. Now build your curriculum.');
    }

    public function edit(Course $course): Response
    {
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

        // Average progress across all enrollments
        $avgProgress = 0;
        if ($totalEnrollments > 0 && $totalLessons > 0) {
            $enrollmentIds = $course->enrollments()->pluck('id');
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

        // ── Per-lesson completion stats ────────────────────────────────────────
        $lessonStats = $course->sections()
            ->orderBy('order')
            ->with(['lessons' => function ($q) {
                $q->orderBy('order')
                  ->withCount(['lessonProgress as completed_count' => fn($q2) => $q2->whereNotNull('completed_at')]);
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

        // ── Enrolled students ──────────────────────────────────────────────────
        $students = $course->enrollments()
            ->with([
                'user:id,name,email',
                'lessonProgress' => fn($q) => $q->whereNotNull('completed_at')->select('enrollment_id'),
            ])
            ->latest('enrolled_at')
            ->get()
            ->map(fn($enrollment) => [
                'id'               => $enrollment->id,
                'user_name'        => $enrollment->user->name,
                'user_email'       => $enrollment->user->email,
                'enrolled_at'      => $enrollment->enrolled_at?->format('M j, Y'),
                'completed_at'     => $enrollment->completed_at?->format('M j, Y'),
                'progress'         => $totalLessons > 0
                    ? (int) round(($enrollment->lessonProgress->count() / $totalLessons) * 100) : 0,
                'certificate_uuid' => $enrollment->certificate_uuid,
            ]);

        return Inertia::render('Admin/Courses/Edit', [
            'course'          => $course,
            'defaultTemplate' => \App\Models\Course::defaultCertificateTemplate(),
            'analytics'       => $analytics,
            'students'        => $students,
            'lessonStats'     => $lessonStats,
            'flash'           => session()->only(['success', 'error']),
        ]);
    }

    public function updateCertificate(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'certificate_template'                          => 'required|array',
            'certificate_template.enabled'                  => 'required|boolean',
            'certificate_template.size'                     => 'required|in:a4,letter',
            'certificate_template.orientation'              => 'required|in:landscape,portrait',
            'certificate_template.background'               => 'required|array',
            'certificate_template.background.type'          => 'required|in:color,image',
            'certificate_template.background.color'         => 'nullable|string|max:20',
            'certificate_template.background.image_url'     => 'nullable|url|max:1000',
            'certificate_template.branding'                 => 'required|array',
            'certificate_template.fields'                   => 'required|array',
            'certificate_template.signatory'                => 'required|array',
            'certificate_template.requirements'             => 'required|array',
            'certificate_template.requirements.type'        => 'required|in:all_lessons,percentage,specific_sections,specific_lessons',
            'certificate_template.requirements.percentage'  => 'nullable|integer|min:1|max:100',
            'certificate_template.requirements.section_ids' => 'nullable|array',
            'certificate_template.requirements.lesson_ids'  => 'nullable|array',
        ]);

        $course->update(['certificate_template' => $validated['certificate_template']]);

        return back()->with('success', 'Certificate template saved.');
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'slug'        => ['nullable', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($course->id)],
            'description' => 'nullable|string',
            'cover_image' => 'nullable|url|max:500',
            'category'    => 'nullable|string|max:100',
            'difficulty'  => 'required|in:beginner,intermediate,advanced',
            'status'      => 'required|in:draft,review,published',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $course->update($validated);

        return back()->with('success', 'Course details saved.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $course->delete();

        return redirect()->route('admin.courses.index')
            ->with('success', 'Course deleted.');
    }
}
