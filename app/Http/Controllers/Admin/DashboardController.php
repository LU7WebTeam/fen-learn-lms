<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Support\SystemLogReader;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(SystemLogReader $systemLogReader): Response
    {
        $user = request()->user();

        $courseScope = Course::query();
        $enrollmentScope = Enrollment::query();

        if ($user?->isCourseViewer()) {
            $permittedCourseIds = $user->permittedCourses()->pluck('courses.id');
            $courseScope->whereIn('id', $permittedCourseIds);
            $enrollmentScope->whereIn('course_id', $permittedCourseIds);
        }

        $totalUsers       = $user?->isCourseViewer()
            ? User::where('role', 'learner')
                ->whereHas('enrollments', fn($q) => $q->whereIn('course_id', $user->permittedCourses()->select('courses.id')))
                ->count()
            : User::where('role', 'learner')->count();
        $totalCourses     = (clone $courseScope)->count();
        $totalEnrollments = (clone $enrollmentScope)->count();
        $completedCount   = (clone $enrollmentScope)->whereNotNull('completed_at')->count();
        $completionRate   = $totalEnrollments > 0
            ? (int) round(($completedCount / $totalEnrollments) * 100)
            : 0;

        $recentSystemErrors = [];

        if ($user?->isSuperAdmin()) {
            $recentSystemErrors = $systemLogReader
                ->read(['level' => 'error'])
                ->take(5)
                ->map(fn (array $entry) => [
                    'timestamp' => $entry['timestamp'],
                    'message' => $entry['message'],
                    'request_id' => $entry['request_id'],
                    'request_path' => $entry['request_path'],
                ])
                ->values()
                ->all();
        }

        $recentCourses = Course::with('creator:id,name')
            ->when($user?->isCourseViewer(), fn($q) => $q->whereIn('id', $user->permittedCourses()->select('courses.id')))
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'slug', 'status', 'difficulty', 'created_by', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers'       => $totalUsers,
                'totalCourses'     => $totalCourses,
                'totalEnrollments' => $totalEnrollments,
                'completionRate'   => $completionRate,
            ],
            'canViewSystemLogs' => $user?->isSuperAdmin() ?? false,
            'recentSystemErrors' => $recentSystemErrors,
            'recentCourses' => $recentCourses,
        ]);
    }
}
