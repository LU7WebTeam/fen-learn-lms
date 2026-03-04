<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LessonsController extends Controller
{
    public function store(Request $request, Section $section): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type'  => 'required|in:video,text,quiz',
        ]);

        $order = $section->lessons()->max('order') + 1;

        $lesson = $section->lessons()->create([
            'title' => $request->title,
            'type'  => $request->type,
            'order' => $order,
        ]);

        return redirect()->route('admin.lessons.edit', $lesson)
            ->with('success', 'Lesson created. Add your content below.');
    }

    public function edit(Lesson $lesson): Response
    {
        $lesson->load('section.course');

        return Inertia::render('Admin/Lessons/Edit', [
            'lesson' => $lesson,
            'flash'  => session()->only(['success', 'error']),
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $rules = [
            'title'            => 'required|string|max:255',
            'duration_minutes' => 'nullable|integer|min:0',
            'is_free_preview'  => 'boolean',
        ];

        if ($lesson->type === 'video') {
            $rules['video_url'] = 'nullable|url|max:500';
            $rules['content']   = 'nullable|string';
        } elseif ($lesson->type === 'text') {
            $rules['content'] = 'nullable|string';
        } elseif ($lesson->type === 'quiz') {
            $rules['content'] = 'nullable|string';
        }

        $validated = $request->validate($rules);

        $lesson->update($validated);

        return back()->with('success', 'Lesson saved.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $courseId = $lesson->section->course_id;
        $lesson->delete();

        return redirect()->route('admin.courses.edit', $courseId)
            ->with('success', 'Lesson deleted.');
    }

    public function reorder(Request $request, Section $section): RedirectResponse
    {
        $request->validate([
            'lessons'   => 'required|array',
            'lessons.*' => 'integer|exists:lessons,id',
        ]);

        foreach ($request->lessons as $order => $id) {
            $section->lessons()->where('id', $id)->update(['order' => $order]);
        }

        return back();
    }
}
