@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $title }}</h2>
    <p>Hello,</p>
    <p>Please confirm your email address for <strong>{{ $platformName }}</strong> by clicking the button below.</p>

    <div class="button-wrap">
        <a href="{{ $actionUrl }}" class="button">{{ $actionText }}</a>
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">If the button does not work, copy and paste this URL into your browser:</p>
    <p class="url-fallback">{{ $actionUrl }}</p>

    <div class="meta">
        <p><strong>Account:</strong> {{ $email }}</p>
        <p style="margin-top:6px;"><strong>Expires in:</strong> {{ $expiresInMinutes }} minutes</p>
    </div>
@endcomponent
