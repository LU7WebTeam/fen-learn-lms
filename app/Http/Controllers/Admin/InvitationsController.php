<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\StaffInvitationMail;
use App\Models\StaffInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationsController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:users,email',
            'role'  => 'required|in:content_editor,super_admin',
        ]);

        StaffInvitation::where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->delete();

        $invitation = StaffInvitation::create([
            'email'      => $validated['email'],
            'role'       => $validated['role'],
            'token'      => Str::random(48),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        try {
            Mail::to($validated['email'])->send(new StaffInvitationMail($invitation));
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Invitation created, but email could not be sent. Please verify SMTP settings and try again.');
        }

        return back()->with('success', "Invitation sent to {$validated['email']}.");
    }

    public function show(string $token): Response|RedirectResponse
    {
        $invitation = StaffInvitation::where('token', $token)->first();

        if (!$invitation || !$invitation->isPending()) {
            return Inertia::render('Auth/InvitationInvalid');
        }

        if (User::where('email', $invitation->email)->exists()) {
            $invitation->update(['accepted_at' => now()]);
            return redirect()->route('admin.login')
                ->with('status', 'Your account already exists. Please log in.');
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'token' => $token,
            'email' => $invitation->email,
            'role'  => $invitation->role,
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = StaffInvitation::where('token', $token)->first();

        if (!$invitation || !$invitation->isPending()) {
            return redirect()->route('admin.login')
                ->withErrors(['token' => 'This invitation is invalid or has expired.']);
        }

        $validated = $request->validate([
            'name'                  => 'required|string|max:255',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'               => $validated['name'],
            'email'              => $invitation->email,
            'password'           => Hash::make($validated['password']),
            'role'               => $invitation->role,
            'email_verified_at'  => now(),
            'profile_completed_at' => now(),
        ]);

        $invitation->update(['accepted_at' => now()]);

        return redirect()->route('admin.login')
            ->with('status', 'Account created! You can now log in with your admin credentials.');
    }
}
