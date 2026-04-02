<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LocaleController extends Controller
{
    public function set(Request $request): RedirectResponse
    {
        $defaultLocale = (string) Setting::get('default_locale', 'en');
        if (!in_array($defaultLocale, ['en', 'ms'], true)) {
            $defaultLocale = 'en';
        }

        $locale = (string) $request->input('locale', $defaultLocale);
        if (!in_array($locale, ['en', 'ms'], true)) {
            $locale = $defaultLocale;
        }

        session(['locale' => $locale]);

        return back();
    }
}
