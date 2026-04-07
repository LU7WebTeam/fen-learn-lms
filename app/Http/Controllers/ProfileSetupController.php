<?php

namespace App\Http\Controllers;

use App\Support\ProfileOrganizationOptions;
use App\Support\UserHomeRoute;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileSetupController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->profile_completed_at) {
            return redirect()->route(UserHomeRoute::nameFor($user));
        }

        return Inertia::render('Auth/ProfileSetup', [
            'user' => [
                'name'         => $user->name,
                'gender'       => $user->gender,
                'race'         => $user->race,
                'state'        => $user->state,
                'birthdate'    => $user->birthdate?->format('Y-m-d'),
                'occupation'   => $user->occupation,
                'occupation_other' => $user->occupation_other,
                'student_id'   => $user->student_id,
                'organization' => $user->organization,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'gender'       => 'required|in:male,female',
            'race'         => 'required|in:malay,chinese,indian,other_bumiputera,other',
            'state'        => 'required|string|max:100',
            'birthdate'    => 'required|date|before:today',
            'occupation'   => 'required|string|max:100',
            'occupation_other' => 'nullable|string|max:150|required_if:occupation,other',
            'student_id'   => 'nullable|string|max:100|required_if:occupation,student',
        ] + ProfileOrganizationOptions::rules($request));

        $validated = ProfileOrganizationOptions::normalize($validated);

        $request->user()->update([
            'name'                 => $validated['name'],
            'gender'               => $validated['gender'],
            'race'                 => $validated['race'],
            'state'                => $validated['state'],
            'birthdate'            => $validated['birthdate'],
            'occupation'           => $validated['occupation'],
            'occupation_other'     => $validated['occupation_other'] ?? null,
            'student_id'           => $validated['student_id'] ?? null,
            'organization'         => $validated['organization'],
            'profile_completed_at' => now(),
        ]);

        return redirect()->to(UserHomeRoute::postRegistrationUrlFor($request->user()))->with('success', 'Welcome! Your profile has been set up.');
    }
}
