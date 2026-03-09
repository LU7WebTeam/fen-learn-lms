<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private array $defaults = [
        'platform_name'              => 'Free LMS',
        'platform_tagline'           => 'Learn anything, anywhere.',
        'contact_email'              => '',
        'logo_path'                  => null,
        'favicon_path'               => null,
        'allow_registration'         => '1',
        'default_role'               => 'learner',
        'require_email_verification' => '0',
        'default_locale'             => 'en',
        'mail_driver'                => 'smtp',
        'mail_host'                  => '',
        'mail_port'                  => '587',
        'mail_username'              => '',
        'mail_password'              => '',
        'mail_sender_name'           => '',
        'mail_sender_address'        => '',
        'certificates_enabled'       => '1',
        'maintenance_mode'           => '0',
        'maintenance_message'        => 'We are currently down for scheduled maintenance. Please check back soon.',
    ];

    public function index(): Response
    {
        $stored = Setting::allAsArray();
        $settings = array_merge($this->defaults, $stored);

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $group = $request->input('_group');

        match ($group) {
            'branding'     => $this->saveBranding($request),
            'access'       => $this->saveAccess($request),
            'localization' => $this->saveLocalization($request),
            'email'        => $this->saveEmail($request),
            'certificates' => $this->saveCertificates($request),
            'maintenance'  => $this->saveMaintenance($request),
            default        => null,
        };

        return back()->with('success', 'Settings saved.');
    }

    private function saveBranding(Request $request): void
    {
        $request->validate([
            'platform_name'    => 'required|string|max:100',
            'platform_tagline' => 'nullable|string|max:200',
            'contact_email'    => 'nullable|email|max:200',
            'logo'             => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
            'favicon'          => 'nullable|image|mimes:png,ico,jpg,jpeg|max:512',
        ]);

        Setting::set('platform_name', $request->input('platform_name'));
        Setting::set('platform_tagline', $request->input('platform_tagline', ''));
        Setting::set('contact_email', $request->input('contact_email', ''));

        if ($request->hasFile('logo')) {
            $old = Setting::get('logo_path');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('logo')->store('branding', 'public');
            Setting::set('logo_path', $path);
        }

        if ($request->hasFile('favicon')) {
            $old = Setting::get('favicon_path');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('favicon')->store('branding', 'public');
            Setting::set('favicon_path', $path);
        }

        if ($request->input('clear_logo') === '1') {
            $old = Setting::get('logo_path');
            if ($old) Storage::disk('public')->delete($old);
            Setting::set('logo_path', null);
        }

        if ($request->input('clear_favicon') === '1') {
            $old = Setting::get('favicon_path');
            if ($old) Storage::disk('public')->delete($old);
            Setting::set('favicon_path', null);
        }
    }

    private function saveAccess(Request $request): void
    {
        $request->validate([
            'allow_registration'         => 'required|in:0,1',
            'default_role'               => 'required|in:learner,content_editor',
            'require_email_verification' => 'required|in:0,1',
        ]);

        Setting::set('allow_registration', $request->input('allow_registration'));
        Setting::set('default_role', $request->input('default_role'));
        Setting::set('require_email_verification', $request->input('require_email_verification'));
    }

    private function saveLocalization(Request $request): void
    {
        $request->validate([
            'default_locale' => 'required|in:en,ms',
        ]);

        Setting::set('default_locale', $request->input('default_locale'));
    }

    private function saveEmail(Request $request): void
    {
        $request->validate([
            'mail_driver'         => 'required|in:smtp,sendmail,log',
            'mail_host'           => 'nullable|string|max:255',
            'mail_port'           => 'nullable|integer|min:1|max:65535',
            'mail_username'       => 'nullable|string|max:255',
            'mail_sender_name'    => 'nullable|string|max:100',
            'mail_sender_address' => 'nullable|email|max:200',
        ]);

        Setting::set('mail_driver', $request->input('mail_driver'));
        Setting::set('mail_host', $request->input('mail_host', ''));
        Setting::set('mail_port', $request->input('mail_port', '587'));
        Setting::set('mail_username', $request->input('mail_username', ''));
        Setting::set('mail_sender_name', $request->input('mail_sender_name', ''));
        Setting::set('mail_sender_address', $request->input('mail_sender_address', ''));

        $password = $request->input('mail_password', '');
        if ($password !== '') {
            Setting::set('mail_password', $password);
        }
    }

    private function saveCertificates(Request $request): void
    {
        $request->validate([
            'certificates_enabled' => 'required|in:0,1',
        ]);

        Setting::set('certificates_enabled', $request->input('certificates_enabled'));
    }

    private function saveMaintenance(Request $request): void
    {
        $request->validate([
            'maintenance_mode'    => 'required|in:0,1',
            'maintenance_message' => 'nullable|string|max:500',
        ]);

        Setting::set('maintenance_mode', $request->input('maintenance_mode'));
        Setting::set('maintenance_message', $request->input('maintenance_message', ''));
    }
}
