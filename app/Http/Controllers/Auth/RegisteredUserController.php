<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Support\CaptchaVerifier;
use App\Support\SystemLogger;
use App\Support\UserHomeRoute;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        try {
            $allowed = Setting::get('allow_registration', '1');
        } catch (\Throwable) {
            $allowed = '1';
        }

        if ($allowed !== '1') {
            return redirect()->route('login')->with('error', 'Public registration is currently disabled.');
        }

        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        try {
            $allowed        = Setting::get('allow_registration', '1');
            $defaultRole    = Setting::get('default_role', 'learner');
        } catch (\Throwable) {
            $allowed       = '1';
            $defaultRole   = 'learner';
        }

        if ($allowed !== '1') {
            return redirect()->route('login')->with('error', 'Public registration is currently disabled.');
        }

        CaptchaVerifier::enforce($request, 'register');

        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'agree_terms' => ['accepted'],
        ]);

        $role = in_array($defaultRole, ['learner', 'content_editor']) ? $defaultRole : 'learner';

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $role,
        ]);

        event(new Registered($user));

        Auth::login($user);

        SystemLogger::write('info', 'User registration completed', [
            'auth_flow' => 'register',
            'registered_user_id' => $user->id,
            'registered_role' => $user->role,
        ], $request);

        return redirect(route(UserHomeRoute::nameFor($user), absolute: false));
    }
}
