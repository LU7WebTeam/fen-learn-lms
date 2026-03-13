@component('emails.partials.branded-layout', [
    'title' => 'Staff Invitation',
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>You're invited to join the team</h2>
    <p>Hi there,</p>
    <p>
        <strong>{{ $inviterName }}</strong> has invited you to join <strong>{{ $platformName }}</strong> as a <strong>{{ $roleLabel }}</strong>.
    </p>
    <p>Click the button below to set up your account. The link is valid until <strong>{{ $expiresAt }}</strong>.</p>

    <div class="button-wrap">
        <a href="{{ $acceptUrl }}" class="button">Accept Invitation</a>
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">If the button does not work, copy and paste this URL into your browser:</p>
    <p class="url-fallback">{{ $acceptUrl }}</p>

    <div class="meta">
        <p><strong>Invited as:</strong> {{ $roleLabel }}</p>
        <p style="margin-top:6px;"><strong>Expires:</strong> {{ $expiresAt }}</p>
    </div>

    <p style="margin-top:16px;">If you did not expect this invitation, you can safely ignore this email.</p>
@endcomponent
