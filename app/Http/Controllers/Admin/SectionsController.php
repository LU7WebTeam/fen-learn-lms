<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Section;
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

        $course->sections()->create([
            'title'    => $request->title,
            'title_ms' => $request->title_ms,
            'order'    => $order,
        ]);

        return back()->with('success', 'Section added.');
    }

    public function update(Request $request, Section $section): RedirectResponse
    {
        $request->validate([
            'title'    => 'required|string|max:255',
            'title_ms' => 'nullable|string|max:255',
        ]);

        $section->update([
            'title'    => $request->title,
            'title_ms' => $request->title_ms,
        ]);

        return back()->with('success', 'Section renamed.');
    }

    public function destroy(Section $section): RedirectResponse
    {
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

        return back();
    }
}
