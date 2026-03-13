<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ $title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: {{ $theme['background'] }}; margin: 0; padding: 24px 0; color: {{ $theme['text'] }}; }
        .wrapper { max-width: 560px; margin: 0 auto; background: {{ $theme['surface'] }}; border-radius: 12px; overflow: hidden; border: 1px solid {{ $theme['border'] }}; }
        .header { background: linear-gradient(135deg, {{ $theme['primary'] }}, {{ $theme['secondary'] }}); padding: 24px 32px; text-align: center; }
        .logo { display: block; max-height: 48px; margin: 0 auto 10px; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
        .body { padding: 32px; }
        h2 { margin: 0 0 12px; font-size: 22px; font-weight: 700; color: {{ $theme['text'] }}; }
        p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: {{ $theme['text'] }}; }
        .button-wrap { text-align: center; margin: 28px 0; }
        .button { display: inline-block; background: {{ $theme['primary'] }}; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; letter-spacing: -0.2px; }
        .meta { background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 24px 0 0; border: 1px solid {{ $theme['border'] }}; }
        .meta p { margin: 0; font-size: 13px; color: {{ $theme['mutedText'] }}; }
        .meta strong { color: {{ $theme['text'] }}; }
        .footer { border-top: 1px solid {{ $theme['border'] }}; padding: 20px 32px; text-align: center; }
        .footer p { margin: 0; font-size: 12px; color: {{ $theme['mutedText'] }}; }
        .url-fallback { word-break: break-all; color: {{ $theme['secondary'] }}; font-size: 13px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            @if($logoUrl)
                <img src="{{ $logoUrl }}" alt="{{ $platformName }} logo" class="logo" />
            @endif
            <h1>{{ $platformName }}</h1>
        </div>
        <div class="body">
            {{ $slot }}
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $platformName }}</p>
        </div>
    </div>
</body>
</html>
