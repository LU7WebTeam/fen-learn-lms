<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomFont;
use App\Models\Setting;
use App\Support\ActivityLogger;
use App\Support\SystemLogger;
use App\Support\EmailBranding;
use App\Support\EmailContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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
        'mail_scheme'                => 'none',
        'mail_username'              => '',
        'mail_password'              => '',
        'mail_sender_name'           => '',
        'mail_sender_address'        => '',
        'invitation_email_subject'   => "You've been invited to join {{platform_name}}",
        'invitation_email_title'     => "You're invited to join the team",
        'invitation_email_body'      => '{{inviter_name}} has invited you to join {{platform_name}} as a {{role_label}}.',
        'invitation_email_cta'       => 'Accept Invitation',
        'verification_email_subject' => 'Verify your email address',
        'verification_email_title'   => 'Verify your email address',
        'verification_email_body'    => 'Please confirm your email address for {{platform_name}} by clicking the button below.',
        'verification_email_cta'     => 'Verify Email Address',
        'reset_email_subject'        => 'Reset your password',
        'reset_email_title'          => 'Reset your password',
        'reset_email_body'           => 'We received a request to reset your password for {{platform_name}}.',
        'reset_email_cta'            => 'Reset Password',
        'certificates_enabled'       => '1',
        'maintenance_mode'           => '0',
        'maintenance_message'        => 'We are currently down for scheduled maintenance. Please check back soon.',
        'learner_can_enroll'         => '1',
        'editor_can_manage_users'    => '1',
        'editor_can_access_settings' => '1',
        'captcha_provider'           => 'none',
        'captcha_enabled_login'      => '0',
        'captcha_enabled_register'   => '0',
        'captcha_enabled_forgot_password' => '0',
        'captcha_site_key'           => '',
        'captcha_secret_key'         => '',
        'captcha_min_score'          => '0.5',
        'analytics_enabled'          => '0',
        'ga4_measurement_id'         => '',
        'ga4_anonymize_ip'           => '1',
        'ga4_debug_mode'             => '0',
        'system_logging_enabled'     => '1',
        'system_log_level'           => 'info',
        'system_log_retention_days'  => '180',
        'system_log_capture_context' => '1',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->role === 'content_editor') {
            $canAccess = Setting::get('editor_can_access_settings', '1');
            if ($canAccess !== '1') {
                abort(403, 'Your role does not have access to platform settings.');
            }
        }

        $stored = Setting::allAsArray();
        $settings = array_merge($this->defaults, $stored);
        $settings['mail_password'] = '';
        $settings['captcha_secret_key'] = filled((string) Setting::get('captcha_secret_key', ''))
            ? '__configured__'
            : '';

        return Inertia::render('Admin/Settings/Index', [
            'settings'    => $settings,
            'customFonts' => CustomFont::query()
                ->where('is_active', true)
                ->latest()
                ->get(['id', 'name', 'family', 'regular_path', 'bold_path', 'italic_path', 'bold_italic_path']),
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
            'role_access'  => $this->saveRoleAccess($request),
            'security'     => $this->saveSecurity($request),
            'analytics'    => $this->saveAnalytics($request),
            'logging'      => $this->saveLogging($request),
            default        => null,
        };

        if ($group) {
            ActivityLogger::record(
                'Updated settings group: '.$group,
                null,
                ['group' => $group],
                'updated'
            );

            SystemLogger::write('info', 'Settings group updated', [
                'settings_group' => $group,
            ], $request);
        }

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
            'mail_scheme'         => 'nullable|in:none,tls,smtps',
            'mail_username'       => 'nullable|string|max:255',
            'mail_sender_name'    => 'nullable|string|max:100',
            'mail_sender_address' => 'nullable|email|max:200',
            'clear_mail_password' => 'nullable|in:0,1',
            'invitation_email_subject'   => 'nullable|string|max:150',
            'invitation_email_title'     => 'nullable|string|max:150',
            'invitation_email_body'      => 'nullable|string|max:1000',
            'invitation_email_cta'       => 'nullable|string|max:60',
            'verification_email_subject' => 'nullable|string|max:150',
            'verification_email_title'   => 'nullable|string|max:150',
            'verification_email_body'    => 'nullable|string|max:1000',
            'verification_email_cta'     => 'nullable|string|max:60',
            'reset_email_subject'        => 'nullable|string|max:150',
            'reset_email_title'          => 'nullable|string|max:150',
            'reset_email_body'           => 'nullable|string|max:1000',
            'reset_email_cta'            => 'nullable|string|max:60',
        ]);

        $this->validateEmailTemplateGuardrails($request);

        Setting::set('mail_driver', $request->input('mail_driver'));
        Setting::set('mail_host', $request->input('mail_host', ''));
        Setting::set('mail_port', $request->input('mail_port', '587'));
        Setting::set('mail_scheme', $request->input('mail_scheme', 'none'));
        Setting::set('mail_username', $request->input('mail_username', ''));
        Setting::set('mail_sender_name', $request->input('mail_sender_name', ''));
        Setting::set('mail_sender_address', $request->input('mail_sender_address', ''));
        Setting::set('invitation_email_subject', $request->input('invitation_email_subject', $this->defaults['invitation_email_subject']));
        Setting::set('invitation_email_title', $request->input('invitation_email_title', $this->defaults['invitation_email_title']));
        Setting::set('invitation_email_body', $request->input('invitation_email_body', $this->defaults['invitation_email_body']));
        Setting::set('invitation_email_cta', $request->input('invitation_email_cta', $this->defaults['invitation_email_cta']));
        Setting::set('verification_email_subject', $request->input('verification_email_subject', $this->defaults['verification_email_subject']));
        Setting::set('verification_email_title', $request->input('verification_email_title', $this->defaults['verification_email_title']));
        Setting::set('verification_email_body', $request->input('verification_email_body', $this->defaults['verification_email_body']));
        Setting::set('verification_email_cta', $request->input('verification_email_cta', $this->defaults['verification_email_cta']));
        Setting::set('reset_email_subject', $request->input('reset_email_subject', $this->defaults['reset_email_subject']));
        Setting::set('reset_email_title', $request->input('reset_email_title', $this->defaults['reset_email_title']));
        Setting::set('reset_email_body', $request->input('reset_email_body', $this->defaults['reset_email_body']));
        Setting::set('reset_email_cta', $request->input('reset_email_cta', $this->defaults['reset_email_cta']));

        if ($request->input('clear_mail_password') === '1') {
            Setting::set('mail_password', '');
            return;
        }

        $password = $request->input('mail_password', '');
        if ($password !== '') {
            Setting::set('mail_password', $password);
        }
    }

    private function validateEmailTemplateGuardrails(Request $request): void
    {
        $fields = [
            'invitation_email_subject' => ['platform_name', 'inviter_name', 'role_label'],
            'invitation_email_title'   => ['platform_name', 'inviter_name', 'role_label'],
            'invitation_email_body'    => ['platform_name', 'inviter_name', 'role_label'],
            'invitation_email_cta'     => ['platform_name', 'inviter_name', 'role_label'],
            'verification_email_subject' => ['platform_name'],
            'verification_email_title'   => ['platform_name'],
            'verification_email_body'    => ['platform_name'],
            'verification_email_cta'     => ['platform_name'],
            'reset_email_subject'      => ['platform_name'],
            'reset_email_title'        => ['platform_name'],
            'reset_email_body'         => ['platform_name'],
            'reset_email_cta'          => ['platform_name'],
        ];

        $errors = [];

        foreach ($fields as $field => $allowedTokens) {
            $value = (string) $request->input($field, '');
            if ($value === '') {
                continue;
            }

            preg_match_all('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', $value, $matches);
            $usedTokens = array_unique($matches[1] ?? []);

            foreach ($usedTokens as $token) {
                if (!in_array($token, $allowedTokens, true)) {
                    $errors[$field] = 'Unsupported placeholder {{'.$token.'}} in this template field.';
                    break;
                }
            }
        }

        if (!empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }

    public function testEmail(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'recipient' => 'nullable|email|max:200',
        ]);

        $recipient = $validated['recipient']
            ?? Setting::get('mail_sender_address')
            ?? $request->user()?->email;

        if (!$recipient) {
            return back()->with('error', 'Please provide a recipient email for test mail.');
        }

        try {
            $branding = EmailBranding::data();

            Mail::send('emails.smtp-test', [
                ...$branding,
                'host' => $request->getHost(),
                'sentAt' => now()->toDateTimeString(),
            ], function ($message) use ($recipient) {
                $message->to($recipient)->subject('SMTP Test Email');
            });

            return back()->with('success', "Test email sent successfully to {$recipient}.");
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Failed to send test email. Please verify SMTP settings.');
        }
    }

    public function testTemplateEmail(Request $request, string $type): RedirectResponse
    {
        $validated = $request->validate([
            'recipient' => 'nullable|email|max:200',
        ]);

        $recipient = $validated['recipient']
            ?? Setting::get('mail_sender_address')
            ?? $request->user()?->email;

        if (!$recipient) {
            return back()->with('error', 'Please provide a recipient email for test mail.');
        }

        $supportedTypes = ['invitation', 'verification', 'reset'];
        if (!in_array($type, $supportedTypes, true)) {
            return back()->with('error', 'Invalid email template type requested.');
        }

        try {
            $branding = EmailBranding::data();
            $tokens = [
                'platform_name' => $branding['platformName'],
                'inviter_name' => $request->user()?->name ?? 'An administrator',
                'role_label' => 'Content Editor',
            ];

            $testUrls = [
                'invitation' => url('/invite/test-invitation-token'),
                'verification' => url('/email/verify/test'),
                'reset' => url('/reset-password/test-token?email='.urlencode($recipient)),
            ];

            if ($type === 'invitation') {
                $subject = EmailContent::get('invitation_email_subject', "You've been invited to join {{platform_name}}", $tokens);

                Mail::send('emails.staff-invitation', [
                    ...$branding,
                    'acceptUrl' => $testUrls['invitation'],
                    'roleLabel' => $tokens['role_label'],
                    'inviterName' => $tokens['inviter_name'],
                    'expiresAt' => now()->addDays(7)->format('d M Y'),
                    'emailTitle' => EmailContent::get('invitation_email_title', "You're invited to join the team", $tokens),
                    'emailBody' => EmailContent::get('invitation_email_body', '{{inviter_name}} has invited you to join {{platform_name}} as a {{role_label}}.', $tokens),
                    'emailCta' => EmailContent::get('invitation_email_cta', 'Accept Invitation', $tokens),
                ], function ($message) use ($recipient, $subject) {
                    $message->to($recipient)->subject($subject.' [Test]');
                });
            }

            if ($type === 'verification') {
                $subject = EmailContent::get('verification_email_subject', 'Verify your email address', $tokens);

                Mail::send('emails.auth-verify-email', [
                    ...$branding,
                    'title' => EmailContent::get('verification_email_title', 'Verify your email address', $tokens),
                    'email' => $recipient,
                    'actionUrl' => $testUrls['verification'],
                    'actionText' => EmailContent::get('verification_email_cta', 'Verify Email Address', $tokens),
                    'bodyText' => EmailContent::get('verification_email_body', 'Please confirm your email address for {{platform_name}} by clicking the button below.', $tokens),
                    'expiresInMinutes' => 60,
                ], function ($message) use ($recipient, $subject) {
                    $message->to($recipient)->subject($subject.' [Test]');
                });
            }

            if ($type === 'reset') {
                $subject = EmailContent::get('reset_email_subject', 'Reset your password', $tokens);

                Mail::send('emails.auth-reset-password', [
                    ...$branding,
                    'title' => EmailContent::get('reset_email_title', 'Reset your password', $tokens),
                    'email' => $recipient,
                    'actionUrl' => $testUrls['reset'],
                    'actionText' => EmailContent::get('reset_email_cta', 'Reset Password', $tokens),
                    'bodyText' => EmailContent::get('reset_email_body', 'We received a request to reset your password for {{platform_name}}.', $tokens),
                    'expiresInMinutes' => 60,
                ], function ($message) use ($recipient, $subject) {
                    $message->to($recipient)->subject($subject.' [Test]');
                });
            }

            return back()->with('success', ucfirst($type).' test email sent successfully to '.$recipient.'.');
        } catch (\Throwable $e) {
            report($e);
            return back()->with('error', 'Failed to send '.$type.' test email. Please verify SMTP settings and template content.');
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

    private function saveRoleAccess(Request $request): void
    {
        $request->validate([
            'learner_can_enroll'         => 'required|in:0,1',
            'editor_can_manage_users'    => 'required|in:0,1',
            'editor_can_access_settings' => 'required|in:0,1',
        ]);

        Setting::set('learner_can_enroll', $request->input('learner_can_enroll'));
        Setting::set('editor_can_manage_users', $request->input('editor_can_manage_users'));
        Setting::set('editor_can_access_settings', $request->input('editor_can_access_settings'));
    }

    private function saveSecurity(Request $request): void
    {
        $validated = $request->validate([
            'captcha_provider' => 'required|in:none,turnstile,recaptcha',
            'captcha_enabled_login' => 'required|in:0,1',
            'captcha_enabled_register' => 'required|in:0,1',
            'captcha_enabled_forgot_password' => 'required|in:0,1',
            'captcha_site_key' => 'nullable|string|max:255',
            'captcha_secret_key' => 'nullable|string|max:255',
            'clear_captcha_secret_key' => 'nullable|in:0,1',
            'captcha_min_score' => 'nullable|numeric|min:0|max:1',
        ]);

        $provider = $validated['captcha_provider'];
        $siteKey = trim((string) ($validated['captcha_site_key'] ?? ''));
        $newSecret = trim((string) ($validated['captcha_secret_key'] ?? ''));
        $clearSecret = ($validated['clear_captcha_secret_key'] ?? '0') === '1';
        $storedSecret = (string) Setting::get('captcha_secret_key', '');

        if ($provider !== 'none') {
            if ($siteKey === '') {
                throw ValidationException::withMessages([
                    'captcha_site_key' => 'Captcha site key is required when captcha is enabled.',
                ]);
            }

            $hasSecret = $newSecret !== '' || (!$clearSecret && $storedSecret !== '');
            if (!$hasSecret) {
                throw ValidationException::withMessages([
                    'captcha_secret_key' => 'Captcha secret key is required when captcha is enabled.',
                ]);
            }
        }

        Setting::set('captcha_provider', $provider);
        Setting::set('captcha_enabled_login', $validated['captcha_enabled_login']);
        Setting::set('captcha_enabled_register', $validated['captcha_enabled_register']);
        Setting::set('captcha_enabled_forgot_password', $validated['captcha_enabled_forgot_password']);
        Setting::set('captcha_site_key', $siteKey);
        Setting::set('captcha_min_score', (string) ($validated['captcha_min_score'] ?? '0.5'));

        if ($clearSecret) {
            Setting::set('captcha_secret_key', '');
            return;
        }

        if ($newSecret !== '') {
            Setting::set('captcha_secret_key', $newSecret);
        }
    }

    private function saveAnalytics(Request $request): void
    {
        $validated = $request->validate([
            'analytics_enabled' => 'required|in:0,1',
            'ga4_measurement_id' => [
                'nullable',
                'string',
                'max:50',
                'regex:/^G-[A-Z0-9]+$/i',
            ],
            'ga4_anonymize_ip' => 'required|in:0,1',
            'ga4_debug_mode' => 'required|in:0,1',
        ]);

        $enabled = $validated['analytics_enabled'] === '1';
        $measurementId = strtoupper(trim((string) ($validated['ga4_measurement_id'] ?? '')));

        if ($enabled && $measurementId === '') {
            throw ValidationException::withMessages([
                'ga4_measurement_id' => 'GA4 Measurement ID is required when analytics is enabled.',
            ]);
        }

        Setting::set('analytics_enabled', $validated['analytics_enabled']);
        Setting::set('ga4_measurement_id', $measurementId);
        Setting::set('ga4_anonymize_ip', $validated['ga4_anonymize_ip']);
        Setting::set('ga4_debug_mode', $validated['ga4_debug_mode']);
    }

    private function saveLogging(Request $request): void
    {
        $validated = $request->validate([
            'system_logging_enabled' => 'required|in:0,1',
            'system_log_level' => 'required|in:debug,info,warning,error',
            'system_log_retention_days' => 'required|integer|min:1|max:3650',
            'system_log_capture_context' => 'required|in:0,1',
        ]);

        Setting::set('system_logging_enabled', $validated['system_logging_enabled']);
        Setting::set('system_log_level', $validated['system_log_level']);
        Setting::set('system_log_retention_days', (string) $validated['system_log_retention_days']);
        Setting::set('system_log_capture_context', $validated['system_log_capture_context']);
    }
}
