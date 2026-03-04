<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response|\Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        if (in_array($user->role, ['super_admin', 'content_editor'])) {
            return redirect()->route('admin.dashboard');
        }

        $enrollments = $user->enrollments()
            ->with(['course' => function ($q) {
                $q->select('id', 'title', 'slug', 'cover_image', 'category', 'difficulty');
            }, 'lessonProgress'])
            ->get()
            ->map(function ($enrollment) {
                $total = $enrollment->course->lessons()->count();
                $completed = $enrollment->lessonProgress->whereNotNull('completed_at')->count();
                $progress = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

                $lastLesson = $enrollment->lessonProgress()
                    ->whereNotNull('completed_at')
                    ->latest('completed_at')
                    ->first();

                return [
                    'id'           => $enrollment->id,
                    'course'       => $enrollment->course,
                    'progress'     => $progress,
                    'is_completed' => $enrollment->completed_at !== null,
                    'last_lesson_id' => $lastLesson?->lesson_id,
                    'certificate_uuid' => $enrollment->certificate_uuid,
                    'enrolled_at'  => $enrollment->enrolled_at,
                ];
            });

        $inProgress  = $enrollments->filter(fn($e) => !$e['is_completed'])->values();
        $completed   = $enrollments->filter(fn($e) => $e['is_completed'])->values();

        return Inertia::render('Learner/Dashboard', [
            'inProgress' => $inProgress,
            'completed'  => $completed,
        ]);
    }
}
