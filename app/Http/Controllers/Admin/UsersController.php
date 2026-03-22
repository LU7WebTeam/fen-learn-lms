<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
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
            'suspended'     => User::whereNotNull('suspended_at')->count(),
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

        ActivityLogger::record('Updated user role', $user, [
            'title' => $user->name,
            'old_role' => $oldRole,
            'new_role' => $validated['role'],
        ], 'updated');

        return back()->with(
            'success',
            "{$user->name} changed from {$labels[$oldRole]} to {$labels[$validated['role']]}."
        );
    }

    public function suspend(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            return back()->with('error', 'You cannot suspend your own account.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user->update([
            'suspended_at'       => now(),
            'suspension_reason'  => $validated['reason'] ?? null,
        ]);

        ActivityLogger::record('Suspended user', $user, [
            'title' => $user->name,
            'reason' => $validated['reason'] ?? null,
        ], 'updated');

        return back()->with('success', "{$user->name}'s account has been suspended.");
    }

    public function unsuspend(User $user): RedirectResponse
    {
        $user->update([
            'suspended_at'      => null,
            'suspension_reason' => null,
        ]);

        ActivityLogger::record('Unsuspended user', $user, [
            'title' => $user->name,
        ], 'updated');

        return back()->with('success', "{$user->name}'s account has been reinstated.");
    }

    public function show(User $user): \Illuminate\Http\JsonResponse
    {
        $user->loadMissing([
            'enrollments.course',
            'enrollments.lessonProgress',
        ]);

        $enrollments = $user->enrollments->map(function ($enrollment) {
            $totalLessons = $enrollment->course?->lessons()->count() ?? 0;
            $completedCount = $enrollment->lessonProgress->count();
            $progress = $totalLessons > 0
                ? (int) round(($completedCount / $totalLessons) * 100)
                : 0;

            return [
                'id'               => $enrollment->id,
                'course_id'        => $enrollment->course_id,
                'course_title'     => $enrollment->course?->title,
                'course_thumbnail' => $enrollment->course?->thumbnail,
                'enrolled_at'      => $enrollment->enrolled_at?->format('M j, Y'),
                'completed_at'     => $enrollment->completed_at?->format('M j, Y'),
                'total_lessons'    => $totalLessons,
                'completed_count'  => $completedCount,
                'progress'         => $progress,
                'certificate_uuid' => $enrollment->certificate_uuid,
            ];
        })->sortByDesc('enrolled_at')->values();

        return response()->json([
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            'avatar'             => $user->avatar,
            'gender'             => $user->gender,
            'race'               => $user->race,
            'state'              => $user->state,
            'birthdate'          => $user->birthdate?->format('M j, Y'),
            'birthdate_raw'      => $user->birthdate?->format('Y-m-d'),
            'occupation'         => $user->occupation,
            'organization'       => $user->organization,
            'suspended_at'       => $user->suspended_at?->format('M j, Y'),
            'created_at'         => $user->created_at?->format('M j, Y'),
            'enrollments'        => $enrollments,
        ]);
    }

    public function updateProfile(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'gender'       => 'nullable|in:male,female',
            'race'         => 'nullable|string|max:100',
            'state'        => 'nullable|string|max:100',
            'birthdate'    => 'nullable|date',
            'occupation'   => 'nullable|string|max:100',
            'organization' => 'nullable|string|max:255',
        ]);

        $before = $user->only(array_keys($validated));

        $user->update($validated);

        ActivityLogger::record('Updated user profile', $user, [
            'title' => $user->name,
            'updated_fields' => ActivityLogger::changedFields($before, $user->only(array_keys($validated))),
        ], 'updated');

        return back()->with('success', "{$user->name}'s profile has been updated.");
    }

    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        $validated = $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'remember_token' => Str::random(60),
        ]);

        ActivityLogger::record('Reset user password (manual)', $user, [
            'title' => $user->name,
        ], 'updated');

        return back()->with('success', "Password for {$user->name} has been updated.");
    }

    public function sendPasswordResetLink(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->role !== 'super_admin') {
            abort(403);
        }

        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            ActivityLogger::record('Sent password reset link', $user, [
                'title' => $user->name,
            ], 'updated');
            return back()->with('success', "Password reset link sent to {$user->email}.");
        }

        return back()->with('error', 'Failed to send password reset link. Please try again.');
    }
}
