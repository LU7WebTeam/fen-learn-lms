<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class SiteLockController extends Controller
{
    public function show(Request $request): View|RedirectResponse
    {
        if (Setting::get('site_lock_enabled', '0') !== '1') {
            return redirect()->route('home');
        }

        $currentHash = (string) Setting::get('site_lock_password_hash', '');
        $sessionHash = (string) $request->session()->get('site_lock_password_hash', '');

        if ($request->session()->get('site_lock_unlocked', false) && $sessionHash !== '' && hash_equals($sessionHash, $currentHash)) {
            return redirect()->intended(route('home'));
        }

        return view('site-lock');
    }

    public function unlock(Request $request): RedirectResponse
    {
        if (Setting::get('site_lock_enabled', '0') !== '1') {
            return redirect()->route('home');
        }

        $validated = $request->validate([
            'password' => 'required|string|max:255',
        ]);

        $hash = (string) Setting::get('site_lock_password_hash', '');
        if ($hash === '' || !Hash::check($validated['password'], $hash)) {
            return back()->withErrors([
                'password' => 'Incorrect password.',
            ])->onlyInput('password');
        }

        $request->session()->put('site_lock_unlocked', true);
        $request->session()->put('site_lock_password_hash', $hash);

        return redirect()->intended(route('home'));
    }
}
