<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsersController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role === 'content_editor') {
            $canManage = Setting::get('editor_can_manage_users', '1');
            if ($canManage !== '1') {
                abort(403, 'Your role does not have access to user management.');
            }
        }

        $search = $request->input('search', '');

        $staff = User::whereIn('role', ['super_admin', 'content_editor'])
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            }))
            ->withCount('enrollments')
            ->latest()
            ->paginate(20, ['*'], 'staff_page')
            ->withQueryString();

        $students = User::where('role', 'learner')
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            }))
            ->withCount([
                'enrollments',
                'enrollments as completed_enrollments_count' => fn($q) =>
                    $q->whereNotNull('completed_at'),
            ])
            ->latest()
            ->paginate(25, ['*'], 'students_page')
            ->withQueryString();

        $counts = [
            'students'      => User::where('role', 'learner')->count(),
            'editors'       => User::where('role', 'content_editor')->count(),
            'super_admins'  => User::where('role', 'super_admin')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'staff'    => $staff,
            'students' => $students,
            'counts'   => $counts,
            'filters'  => ['search' => $search],
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => 'required|in:learner,content_editor,super_admin',
        ]);

        if ($request->user()->id === $user->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        $labels = [
            'learner'        => 'Student',
            'content_editor' => 'Content Editor',
            'super_admin'    => 'Super Admin',
        ];

        return back()->with(
            'success',
            "{$user->name} changed from {$labels[$oldRole]} to {$labels[$validated['role']]}."
        );
    }
}
