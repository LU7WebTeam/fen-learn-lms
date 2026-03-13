@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $title }}</h2>
    <p>Hello,</p>
    <p>We received a request to reset your password for <strong>{{ $platformName }}</strong>.</p>

    <div class="button-wrap">
        <a href="{{ $actionUrl }}" class="button">{{ $actionText }}</a>
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">If the button does not work, copy and paste this URL into your browser:</p>
    <p class="url-fallback">{{ $actionUrl }}</p>

    <div class="meta">
        <p><strong>Account:</strong> {{ $email }}</p>
        <p style="margin-top:6px;"><strong>Expires in:</strong> {{ $expiresInMinutes }} minutes</p>
    </div>

    <p style="margin-top:16px;">If you did not request this password reset, no further action is needed.</p>
@endcomponent
