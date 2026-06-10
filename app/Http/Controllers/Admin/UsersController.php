<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Setting;
use App\Models\User;
use App\Support\ActivityLogger;
use App\Support\ProfileOrganizationOptions;
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
        if ($request->user()->role === 'course_viewer') {
            abort(403, 'Your role does not have access to user management.');
        }

        if ($request->user()->role === 'content_editor') {
            $canManage = Setting::get('editor_can_manage_users', '1');
            if ($canManage !== '1') {
                abort(403, 'Your role does not have access to user management.');
            }
        }

        $search     = $request->input('search', '');
        $status     = $request->input('status', 'all');      // all|active|suspended
        $joinedFrom = $request->input('joined_from', '');
        $joinedTo   = $request->input('joined_to', '');
        $courseId   = $request->input('course_id', '');      // students only
        $staffRole  = $request->input('staff_role', 'all');  // staff only

        // Profile filters (students only — staff don't have profile fields)
        $gender       = $this->normalizeFilterValues($request->input('gender', []));
        $race         = $this->normalizeFilterValues($request->input('race', []));
        $state        = $this->normalizeFilterValues($request->input('state', []));
        $occupation   = $this->normalizeFilterValues($request->input('occupation', []));
        $fieldOfStudy = $this->normalizeFilterValues($request->input('field_of_study', []));
        $organization = $this->normalizeFilterValues($request->input('organization', []));
        $ageGroup     = $this->normalizeFilterValues($request->input('age_group', []));

        $staff = User::whereIn('role', ['super_admin', 'content_editor', 'course_viewer'])
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($status === 'active',    fn($q) => $q->whereNull('suspended_at'))
            ->when($status === 'suspended', fn($q) => $q->whereNotNull('suspended_at'))
            ->when($joinedFrom, fn($q) => $q->whereDate('created_at', '>=', $joinedFrom))
            ->when($joinedTo,   fn($q) => $q->whereDate('created_at', '<=', $joinedTo))
            ->when($staffRole !== 'all' && $staffRole, fn($q) => $q->where('role', $staffRole))
            ->with(['permittedCourses:id,title,slug'])
            ->withCount('permittedCourses')
            ->withCount('enrollments')
            ->latest()
            ->paginate(20, ['*'], 'staff_page')
            ->withQueryString();

        $studentsQuery = User::where('role', 'learner')
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when($status === 'active',    fn($q) => $q->whereNull('suspended_at'))
            ->when($status === 'suspended', fn($q) => $q->whereNotNull('suspended_at'))
            ->when($joinedFrom, fn($q) => $q->whereDate('created_at', '>=', $joinedFrom))
            ->when($joinedTo,   fn($q) => $q->whereDate('created_at', '<=', $joinedTo))
            ->when($courseId, fn($q) => $q->whereHas('enrollments', fn($eq) => $eq->where('course_id', (int) $courseId)))
            ->when($gender,       fn($q) => $q->whereIn('gender', $gender))
            ->when($race,         fn($q) => $q->whereIn('race', $race))
            ->when($state,        fn($q) => $q->whereIn('state', $state))
            ->when($occupation,   fn($q) => $q->whereIn('occupation', $occupation))
            ->when($fieldOfStudy, fn($q) => $q->whereIn('field_of_study', $fieldOfStudy))
            ->when($organization, fn($q) => $q->whereIn('organization', $organization));

        if ($ageGroup) {
            $this->applyAgeGroupFilters($studentsQuery, $ageGroup);
        }

        $students = $studentsQuery
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
            'course_viewers'=> User::where('role', 'course_viewer')->count(),
            'suspended'     => User::whereNotNull('suspended_at')->count(),
        ];

        $availableCourses = Course::query()
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'status']);

        return Inertia::render('Admin/Users/Index', [
            'staff'    => $staff,
            'students' => $students,
            'counts'   => $counts,
            'filters'  => [
                'search'        => $search,
                'status'        => $status,
                'joined_from'   => $joinedFrom,
                'joined_to'     => $joinedTo,
                'course_id'     => $courseId,
                'staff_role'    => $staffRole,
                'gender'        => $gender,
                'race'          => $race,
                'state'         => $state,
                'occupation'    => $occupation,
                'field_of_study'=> $fieldOfStudy,
                'organization'  => $organization,
                'age_group'     => $ageGroup,
            ],
            'availableCourses' => $availableCourses,
        ]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->role === 'course_viewer') {
            abort(403, 'Unauthorised.');
        }

        $validated = $request->validate([
            'role' => 'required|in:learner,content_editor,super_admin,course_viewer',
        ]);

        if ($request->user()->id === $user->id) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        if ($validated['role'] !== 'course_viewer') {
            $user->permittedCourses()->detach();
        }

        $labels = [
            'learner'        => 'Student',
            'content_editor' => 'Content Editor',
            'super_admin'    => 'Super Admin',
            'course_viewer'  => 'Course Viewer',
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

    public function updateCourseAccess(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->role === 'course_viewer') {
            abort(403, 'Unauthorised.');
        }

        $validated = $request->validate([
            'course_ids' => 'nullable|array',
            'course_ids.*' => 'integer|exists:courses,id',
        ]);

        if ($user->role !== 'course_viewer') {
            return back()->with('error', 'Course access can only be managed for Course Viewer users.');
        }

        $courseIds = array_values(array_unique($validated['course_ids'] ?? []));

        $syncData = [];
        foreach ($courseIds as $courseId) {
            $syncData[$courseId] = [
                'access_level' => 'view',
                'granted_by' => $request->user()->id,
                'granted_at' => now(),
            ];
        }

        $user->permittedCourses()->sync($syncData);

        ActivityLogger::record('Updated course viewer access', $user, [
            'title' => $user->name,
            'course_ids' => $courseIds,
            'assigned_count' => count($courseIds),
        ], 'updated');

        return back()->with('success', "Updated course access for {$user->name}.");
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
        ] + ProfileOrganizationOptions::rules($request));

        $validated = ProfileOrganizationOptions::normalize($validated);

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

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()?->isSuperAdmin()) {
            abort(403, 'Only super admins can delete users.');
        }

        if ($request->user()->is($user)) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->isSuperAdmin() && User::where('role', 'super_admin')->count() <= 1) {
            return back()->with('error', 'You cannot delete the last remaining super admin.');
        }

        $deletedName = $user->name;
        $deletedEmail = $user->email;
        $deletedRole = $user->role;

        ActivityLogger::record('Deleted user', $user, [
            'title' => $deletedName,
            'email' => $deletedEmail,
            'role' => $deletedRole,
        ], 'deleted');

        $user->delete();

        return back()->with('success', "{$deletedName} has been deleted.");
    }

    public function bulkAction(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:suspend,unsuspend,delete,send_reset_link',
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'required|integer|exists:users,id',
        ]);

        $action = $validated['action'];
        $ids    = $validated['ids'];
        $actor  = $request->user();

        if (in_array($action, ['delete', 'send_reset_link']) && ! $actor->isSuperAdmin()) {
            abort(403, 'Only super admins can perform this action.');
        }

        // Never affect the acting admin's own account
        $users = User::whereIn('id', $ids)
            ->where('id', '!=', $actor->id)
            ->get();

        $count = $users->count();

        switch ($action) {
            case 'suspend':
                $applied = 0;
                foreach ($users as $user) {
                    if (! $user->suspended_at) {
                        $user->update(['suspended_at' => now(), 'suspension_reason' => 'Bulk action by admin']);
                        ActivityLogger::record('Suspended user (bulk)', $user, ['title' => $user->name], 'updated');
                        $applied++;
                    }
                }
                return back()->with('success', "Suspended {$applied} user(s).");

            case 'unsuspend':
                $applied = 0;
                foreach ($users as $user) {
                    if ($user->suspended_at) {
                        $user->update(['suspended_at' => null, 'suspension_reason' => null]);
                        ActivityLogger::record('Unsuspended user (bulk)', $user, ['title' => $user->name], 'updated');
                        $applied++;
                    }
                }
                return back()->with('success', "Reinstated {$applied} user(s).");

            case 'send_reset_link':
                $sent = 0;
                foreach ($users as $user) {
                    $status = Password::sendResetLink(['email' => $user->email]);
                    if ($status === Password::RESET_LINK_SENT) {
                        ActivityLogger::record('Sent password reset link (bulk)', $user, ['title' => $user->name], 'updated');
                        $sent++;
                    }
                }
                return back()->with('success', "Sent password reset links to {$sent} user(s).");

            case 'delete':
                $deleted = 0;
                $superAdminCount = User::where('role', 'super_admin')->count();
                foreach ($users as $user) {
                    if ($user->isSuperAdmin() && $superAdminCount <= 1) {
                        continue; // Never delete the last super admin
                    }
                    if ($user->isSuperAdmin()) {
                        $superAdminCount--;
                    }
                    ActivityLogger::record('Deleted user (bulk)', $user, [
                        'title' => $user->name,
                        'email' => $user->email,
                        'role'  => $user->role,
                    ], 'deleted');
                    $user->delete();
                    $deleted++;
                }
                return back()->with('success', "Deleted {$deleted} user(s).");
        }

        return back();
    }

    private function normalizeFilterValues(mixed $values): array
    {
        $items = is_array($values) ? $values : [$values];
        return collect($items)
            ->map(fn($v) => trim((string) $v))
            ->filter()
            ->values()
            ->all();
    }

    private function applyAgeGroupFilters($query, array $ageGroups): mixed
    {
        if ($ageGroups === []) {
            return $query;
        }

        $ageExpr = \Illuminate\Support\Facades\DB::connection()->getDriverName() === 'pgsql'
            ? 'EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate))'
            : 'TIMESTAMPDIFF(YEAR, birthdate, CURDATE())';

        return $query->where(function ($nested) use ($ageGroups, $ageExpr) {
            foreach ($ageGroups as $ageGroup) {
                match ($ageGroup) {
                    'under_18' => $nested->orWhereRaw("{$ageExpr} < 18"),
                    '18_24'    => $nested->orWhereRaw("{$ageExpr} BETWEEN 18 AND 24"),
                    '25_34'    => $nested->orWhereRaw("{$ageExpr} BETWEEN 25 AND 34"),
                    '35_44'    => $nested->orWhereRaw("{$ageExpr} BETWEEN 35 AND 44"),
                    '45_54'    => $nested->orWhereRaw("{$ageExpr} BETWEEN 45 AND 54"),
                    '55_plus'  => $nested->orWhereRaw("{$ageExpr} >= 55"),
                    default    => null,
                };
            }
        });
    }
}
