<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Section;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SectionsController extends Controller
{
    public function store(Request $request, Course $course): RedirectResponse
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'title_ms' => 'nullable|string|max:255',
        ]);

        $order = $course->sections()->max('order') + 1;

        $section = $course->sections()->create([
            'title'    => $request->title,
            'title_ms' => $request->title_ms,
            'order'    => $order,
        ]);

        ActivityLogger::record('Created section', $section, [
            'title' => $section->title,
            'course_id' => $course->id,
        ], 'created');

        return back()->with('success', 'Section added.');
    }

    public function update(Request $request, Section $section): RedirectResponse
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'title_ms' => 'nullable|string|max:255',
        ]);

        $oldTitle = $section->title;

        $section->update([
            'title'    => $request->title,
            'title_ms' => $request->title_ms,
        ]);

        ActivityLogger::record('Updated section', $section, [
            'title' => $section->title,
            'updated_fields' => $oldTitle !== $section->title ? ['title', 'title_ms'] : ['title_ms'],
            'course_id' => $section->course_id,
        ], 'updated');

        return back()->with('success', 'Section renamed.');
    }

    public function destroy(Section $section): RedirectResponse
    {
        ActivityLogger::record('Deleted section', $section, [
            'title' => $section->title,
            'course_id' => $section->course_id,
            'lesson_count' => $section->lessons()->count(),
        ], 'deleted');

        $section->delete();

        return back()->with('success', 'Section deleted.');
    }

    public function reorder(Request $request, Course $course): RedirectResponse
    {
        $request->validate([
            'sections'   => 'required|array',
            'sections.*' => 'integer|exists:sections,id',
        ]);

        foreach ($request->sections as $order => $id) {
            $course->sections()->where('id', $id)->update(['order' => $order]);
        }

        ActivityLogger::record('Reordered sections', $course, [
            'title' => $course->title,
            'course_id' => $course->id,
        ], 'updated');

        return back();
    }

    public function duplicate(Section $section): RedirectResponse
    {
        $order = $section->course->sections()->max('order') + 1;

        $newSection        = $section->replicate();
        $newSection->title = 'Copy of ' . $section->title;
        $newSection->order = $order;
        $newSection->save();

        foreach ($section->lessons()->orderBy('order')->get() as $lesson) {
            $newLesson             = $lesson->replicate();
            $newLesson->section_id = $newSection->id;
            $newLesson->save();
        }

        ActivityLogger::record('Duplicated section', $newSection, [
            'title' => $newSection->title,
            'course_id' => $newSection->course_id,
            'source_section_id' => $section->id,
            'lesson_count' => $newSection->lessons()->count(),
        ], 'created');

        return back()->with('success', 'Section duplicated.');
    }
}
