<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Staff Invitation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 24px 0; color: #18181b; }
        .wrapper { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7; }
        .header { background: #18181b; padding: 32px 40px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
        .body { padding: 36px 40px; }
        .badge { display: inline-block; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 600; color: #52525b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        h2 { margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #18181b; }
        p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #3f3f46; }
        .button-wrap { text-align: center; margin: 28px 0; }
        .button { display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; letter-spacing: -0.2px; }
        .meta { background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 24px 0 0; }
        .meta p { margin: 0; font-size: 13px; color: #71717a; }
        .meta strong { color: #3f3f46; }
        .footer { border-top: 1px solid #e4e4e7; padding: 20px 40px; text-align: center; }
        .footer p { margin: 0; font-size: 12px; color: #a1a1aa; }
        .url-fallback { word-break: break-all; color: #6366f1; font-size: 13px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <h1>{{ $platformName }}</h1>
        </div>
        <div class="body">
            <div class="badge">Staff Invitation</div>
            <h2>You're invited to join the team</h2>
            <p>Hi there,</p>
            <p>
                <strong>{{ $inviterName }}</strong> has invited you to join <strong>{{ $platformName }}</strong> as a <strong>{{ $roleLabel }}</strong>.
            </p>
            <p>Click the button below to set up your account. The link is valid until <strong>{{ $expiresAt }}</strong>.</p>
            <div class="button-wrap">
                <a href="{{ $acceptUrl }}" class="button">Accept Invitation &rarr;</a>
            </div>
            <p style="font-size:13px;color:#71717a;">If the button doesn't work, copy and paste this URL into your browser:</p>
            <p class="url-fallback">{{ $acceptUrl }}</p>
            <div class="meta">
                <p><strong>Invited as:</strong> {{ $roleLabel }}</p>
                <p style="margin-top:6px;"><strong>Expires:</strong> {{ $expiresAt }}</p>
            </div>
        </div>
        <div class="footer">
            <p>If you did not expect this invitation, you can safely ignore this email.</p>
            <p style="margin-top:6px;">&copy; {{ date('Y') }} {{ $platformName }}</p>
        </div>
    </div>
</body>
</html>
