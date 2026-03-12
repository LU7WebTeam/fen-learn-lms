<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomFont;
use App\Models\Course;
use App\Models\LessonProgress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            ->map(fn($enrollment) => [
                'id'                   => $enrollment->id,
                'user_id'              => $enrollment->user->id,
                'user_name'            => $enrollment->user->name,
                'user_email'           => $enrollment->user->email,
                'user_avatar'          => $enrollment->user->avatar,
                'user_gender'          => $enrollment->user->gender,
                'user_race'            => $enrollment->user->race,
                'user_state'           => $enrollment->user->state,
                'user_birthdate'       => $enrollment->user->birthdate?->format('M j, Y'),
                'user_birthdate_raw'   => $enrollment->user->birthdate?->format('Y-m-d'),
                'user_occupation'      => $enrollment->user->occupation,
                'user_organization'    => $enrollment->user->organization,
                'enrolled_at'          => $enrollment->enrolled_at?->format('M j, Y'),
                'completed_at'         => $enrollment->completed_at?->format('M j, Y'),
                'progress'             => $totalLessons > 0
                    ? (int) round(($enrollment->lessonProgress->count() / $totalLessons) * 100) : 0,
                'certificate_uuid'     => $enrollment->certificate_uuid,
                'completed_lesson_ids' => $enrollment->lessonProgress->pluck('lesson_id')->all(),
                'last_activity'        => $enrollment->lessonProgress->max('completed_at')
                    ? \Carbon\Carbon::parse($enrollment->lessonProgress->max('completed_at'))->format('M j, Y')
                    : null,
            ]);

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
            'flash'           => session()->only(['success', 'error']),
        ]);
    }

    public function updateIntroduction(Request $request, Course $course): RedirectResponse
    {
        $request->validate([
            'introduction'    => 'nullable|array',
            'introduction_ms' => 'nullable|array',
        ]);

        $course->update([
            'introduction'    => $request->input('introduction'),
            'introduction_ms' => $request->input('introduction_ms'),
        ]);

        return back()->with('success', 'Introduction saved.');
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

        return back()->with('success', 'Certificate template saved.');
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
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

        $course->update($validated);

        return back()->with('success', 'Course details saved.');
    }

    public function duplicate(Course $course): RedirectResponse
    {
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

        return redirect()->route('admin.courses.edit', $newCourse)
            ->with('success', 'Course duplicated. You are now editing the copy.');
    }

    public function destroy(Course $course): RedirectResponse
    {
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
}
