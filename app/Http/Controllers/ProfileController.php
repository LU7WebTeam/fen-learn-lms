<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Support\ProfileOrganizationOptions;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status'          => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = ProfileOrganizationOptions::normalize($request->safe()->except('email'));

        $user->fill(collect($validated)->only([
            'name',
            'gender',
            'race',
            'state',
            'birthdate',
            'occupation',
            'occupation_other',
            'student_id',
            'field_of_study',
            'organization',
        ])->all());

        if ($request->hasFile('avatar_file')) {
            if ($user->avatar && str_contains($user->avatar, '/storage/')) {
                $old = preg_replace('#^.*/storage/#', '', $user->avatar);
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('avatar_file')->store('avatars', 'public');
            $user->avatar = Storage::url($path);
        } elseif ($request->boolean('avatar_clear')) {
            if ($user->avatar && str_contains($user->avatar, '/storage/')) {
                $old = preg_replace('#^.*/storage/#', '', $user->avatar);
                Storage::disk('public')->delete($old);
            }
            $user->avatar = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
