<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function set(Request $request): RedirectResponse
    {
        $locale = $request->input('locale', 'en');
        if (!in_array($locale, ['en', 'ms'])) {
            $locale = 'en';
        }
        session(['locale' => $locale]);
        return back();
    }
}
