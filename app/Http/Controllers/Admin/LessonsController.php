<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Section;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LessonsController extends Controller
{
    public function store(Request $request, Section $section): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $request->validate([
            'title' => 'required|string|max:255',
            'type'  => 'required|in:video,text,quiz,pdf',
        ]);

        $order = $section->lessons()->max('order') + 1;

        $lesson = $section->lessons()->create([
            'title' => $request->title,
            'type'  => $request->type,
            'order' => $order,
        ]);

        ActivityLogger::record('Created lesson', $lesson, [
            'title' => $lesson->title,
            'section_id' => $section->id,
        ], 'created');

        return redirect()->route('admin.lessons.edit', $lesson)
            ->with('success', 'Lesson created. Add your content below.');
    }

    public function edit(Lesson $lesson): Response
    {
        $lesson->loadMissing('section.course');
        $this->authorizeCourseView(request(), $lesson->section->course);

        $lesson->load('section.course.sections.lessons');

        $courseLessons = $lesson->section->course->sections
            ->flatMap(fn($s) => $s->lessons->map(fn($l) => [
                'id'      => $l->id,
                'title'   => $l->title,
                'section' => $s->title,
                'type'    => $l->type,
            ]))
            ->filter(fn($l) => $l['id'] !== $lesson->id)
            ->values();

        return Inertia::render('Admin/Lessons/Edit', [
            'lesson'        => $lesson,
            'courseLessons' => $courseLessons,
            'flash'         => session()->only(['success', 'error']),
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $rules = [
            'title'                   => 'required|string|max:255',
            'title_ms'                => 'nullable|string|max:255',
            'duration_minutes'        => 'nullable|integer|min:0',
            'is_free_preview'         => 'boolean',
            'allow_seeking'           => 'boolean',
            'prerequisite_lesson_id'  => 'nullable|integer|exists:lessons,id',
        ];

        if ($lesson->type === 'video') {
            $rules['video_url']   = 'nullable|string|max:500';
            $rules['video_file']  = 'nullable|file|mimetypes:video/mp4,video/webm,video/ogg,video/quicktime|max:204800';
            $rules['content']     = 'nullable|string';
            $rules['content_ms']  = 'nullable|string';
        } elseif ($lesson->type === 'text') {
            $rules['content']    = 'nullable|string';
            $rules['content_ms'] = 'nullable|string';
        } elseif ($lesson->type === 'quiz') {
            $rules['content']    = 'nullable|string';
            $rules['content_ms'] = 'nullable|string';
        } elseif ($lesson->type === 'pdf') {
            $rules['pdf_url']    = 'nullable|string|max:500';
            $rules['pdf_file']   = 'nullable|file|mimetypes:application/pdf|max:20480';
            $rules['content']    = 'nullable|string';
            $rules['content_ms'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        if ($lesson->type === 'video' && $request->hasFile('video_file')) {
            $this->deleteStoredFile($lesson->video_url);
            $path = $request->file('video_file')->store('videos', 's3');
            $validated['video_url'] = Storage::disk('s3')->url($path);
        }
        unset($validated['video_file']);

        if ($lesson->type === 'pdf' && $request->hasFile('pdf_file')) {
            $this->deleteStoredFile($lesson->pdf_url);
            $path = $request->file('pdf_file')->store('pdfs', 's3');
            $validated['pdf_url'] = Storage::disk('s3')->url($path);
        }
        unset($validated['pdf_file']);

        $before = $lesson->only(array_keys($validated));

        $lesson->update($validated);

        ActivityLogger::record('Updated lesson', $lesson, [
            'title' => $lesson->title,
            'section_id' => $lesson->section_id,
            'updated_fields' => ActivityLogger::changedFields($before, $lesson->only(array_keys($validated))),
        ], 'updated');

        return back()->with('success', 'Lesson saved.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $this->authorizeCourseManagement(request());

        ActivityLogger::record('Deleted lesson', $lesson, [
            'title' => $lesson->title,
            'section_id' => $lesson->section_id,
        ], 'deleted');

        $this->deleteStoredFile($lesson->video_url);
        $this->deleteStoredFile($lesson->pdf_url);

        $courseSlug = $lesson->section->course->slug;
        $lesson->delete();

        return redirect()->route('admin.courses.edit', ['course' => $courseSlug, 'tab' => 'curriculum'])
            ->with('success', 'Lesson deleted.');
    }

    public function reorder(Request $request, Section $section): RedirectResponse
    {
        $this->authorizeCourseManagement($request);

        $request->validate([
            'lessons'   => 'required|array',
            'lessons.*' => 'integer|exists:lessons,id',
        ]);

        foreach ($request->lessons as $order => $id) {
            $section->lessons()->where('id', $id)->update(['order' => $order]);
        }

        ActivityLogger::record('Reordered lessons', $section, [
            'title' => $section->title,
            'section_id' => $section->id,
        ], 'updated');

        return back();
    }

    public function duplicate(Lesson $lesson): RedirectResponse
    {
        $this->authorizeCourseManagement(request());

        $section = $lesson->section;
        $order   = $section->lessons()->max('order') + 1;

        $newLesson        = $lesson->replicate();
        $newLesson->title = 'Copy of ' . $lesson->title;
        $newLesson->order = $order;
        $newLesson->save();

        ActivityLogger::record('Duplicated lesson', $newLesson, [
            'title' => $newLesson->title,
            'section_id' => $newLesson->section_id,
            'source_lesson_id' => $lesson->id,
        ], 'created');

        return redirect()->route('admin.courses.edit', ['course' => $section->course->slug, 'tab' => 'curriculum'])
            ->with('success', 'Lesson duplicated.');
    }

    private function deleteStoredFile(?string $url): void
    {
        if (!$url) return;
        if (str_contains($url, '/storage/')) {
            $path = preg_replace('#^.*/storage/#', '', $url);
            Storage::disk('public')->delete($path);
        } elseif (filter_var($url, FILTER_VALIDATE_URL)) {
            $parsed = parse_url($url);
            $path = ltrim($parsed['path'] ?? '', '/');
            if ($path) {
                Storage::disk('s3')->delete($path);
            }
        }
    }

    private function authorizeCourseManagement(Request $request): void
    {
        if (!$request->user()?->canManageCourses()) {
            abort(403, 'Your role has view-only access to courses.');
        }
    }

    private function authorizeCourseView(Request $request, \App\Models\Course $course): void
    {
        if (!$request->user()?->canViewCourse($course)) {
            abort(403, 'You are not permitted to access this course.');
        }
    }
}
