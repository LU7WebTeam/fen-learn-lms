<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers       = User::where('role', 'learner')->count();
        $totalCourses     = Course::count();
        $totalEnrollments = Enrollment::count();
        $completedCount   = Enrollment::whereNotNull('completed_at')->count();
        $completionRate   = $totalEnrollments > 0
            ? (int) round(($completedCount / $totalEnrollments) * 100)
            : 0;

        $recentCourses = Course::with('creator:id,name')
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'status', 'difficulty', 'created_by', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers'       => $totalUsers,
                'totalCourses'     => $totalCourses,
                'totalEnrollments' => $totalEnrollments,
                'completionRate'   => $completionRate,
            ],
            'recentCourses' => $recentCourses,
        ]);
    }
}
