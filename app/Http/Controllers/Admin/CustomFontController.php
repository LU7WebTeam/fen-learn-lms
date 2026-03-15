<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomFont;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomFontController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'             => 'nullable|string|max:120',
            'family'           => 'nullable|string|max:120',
            // Keep validation extension-based because browser MIME reporting for font files varies widely.
            'regular_file'     => 'required|file|mimes:ttf,otf|max:5120',
            'bold_file'        => 'nullable|file|mimes:ttf,otf|max:5120',
            'italic_file'      => 'nullable|file|mimes:ttf,otf|max:5120',
            'bold_italic_file' => 'nullable|file|mimes:ttf,otf|max:5120',
        ]);

        $derivedName = pathinfo($request->file('regular_file')->getClientOriginalName(), PATHINFO_FILENAME);
        $fontName = trim((string) ($validated['name'] ?? ''));
        if ($fontName === '') {
            $fontName = Str::of($derivedName)
                ->replace(['_', '-'], ' ')
                ->squish()
                ->title()
                ->toString();
        }

        if ($fontName === '') {
            $fontName = 'Custom Font';
        }

        $folder = 'fonts/' . now()->format('YmdHis') . '-' . Str::slug($fontName);

        $regular = $request->file('regular_file')->store($folder, 'public');
        $bold = $request->hasFile('bold_file')
            ? $request->file('bold_file')->store($folder, 'public')
            : null;
        $italic = $request->hasFile('italic_file')
            ? $request->file('italic_file')->store($folder, 'public')
            : null;
        $boldItalic = $request->hasFile('bold_italic_file')
            ? $request->file('bold_italic_file')->store($folder, 'public')
            : null;

        CustomFont::create([
            'name'             => $fontName,
            'family'           => $validated['family'] ?: $fontName,
            'regular_path'     => $regular,
            'bold_path'        => $bold,
            'italic_path'      => $italic,
            'bold_italic_path' => $boldItalic,
            'is_active'        => true,
            'created_by'       => $request->user()?->id,
        ]);

        return back()->with('success', 'Custom font uploaded. You can now use it in Certificate Builder.');
    }

    public function destroy(CustomFont $font): RedirectResponse
    {
        $isInUse = Course::query()
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(certificate_template, '$.custom_font_id')) = ?", [(string) $font->id])
            ->exists();

        if ($isInUse) {
            return back()->with('error', 'This font is currently used by one or more course certificates. Please switch those templates first.');
        }

        foreach (['regular_path', 'bold_path', 'italic_path', 'bold_italic_path'] as $key) {
            if ($font->{$key}) {
                Storage::disk('public')->delete($font->{$key});
            }
        }

        $font->delete();

        return back()->with('success', 'Custom font deleted.');
    }
}
