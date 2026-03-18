@component('emails.partials.branded-layout', [
    'title' => 'Your login verification code',
    'platformName' => $branding['platformName'] ?? config('app.name'),
    'logoUrl' => $branding['logoUrl'] ?? null,
    'theme' => $branding['theme'] ?? [],
])
    <h2>Login Verification Code</h2>
    <p>Hello {{ $user->name }},</p>
    <p>You've requested to log in to your account. To complete your login, please use the verification code below:</p>

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
            {{ $code }}
        </div>
    </div>

    <p>This code will expire in <strong>10 minutes</strong>.</p>

    <div class="meta">
        <p><strong>Account:</strong> {{ $user->email }}</p>
        <p style="margin-top: 6px; color: #999; font-size: 12px;">If you didn't request this code, please ignore this email and ensure your account is secure.</p>
    </div>
@endcomponent
