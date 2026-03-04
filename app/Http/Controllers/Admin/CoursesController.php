<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
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
                $q2->orderBy('order');
            }]);
        }]);

        return Inertia::render('Admin/Courses/Edit', [
            'course'  => $course,
            'flash'   => session()->only(['success', 'error']),
        ]);
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
