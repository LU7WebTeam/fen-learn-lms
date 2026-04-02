@component('emails.partials.branded-layout', [
    'title' => 'Staff Invitation',
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $emailTitleBM ?: $emailTitle }}</h2>
    @if (!empty($emailTitleBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $emailTitle }}</p>
    @endif
    
    <p>Hi there,</p>
    <p>{!! nl2br(e($emailBodyBM ?: $emailBody)) !!}</p>
    @if (!empty($emailBodyBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{!! nl2br(e($emailBody)) !!}</p>
    @endif
    
    <p>Click the button below to set up your account. The link is valid until <strong>{{ $expiresAt }}</strong>.</p>

    <div class="button-wrap">
        <a href="{{ $acceptUrl }}" class="button">{{ $emailCtaBM ?: $emailCta }}</a>
        @if (!empty($emailCtaBM))
            <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 4px;">{{ $emailCta }}</p>
        @endif
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">If the button does not work, copy and paste this URL into your browser:</p>
    <p class="url-fallback">{{ $acceptUrl }}</p>

    <div class="meta">
        <p><strong>Invited as:</strong> {{ $roleLabel }}</p>
        <p style="margin-top:6px;"><strong>Expires:</strong> {{ $expiresAt }}</p>
    </div>

    <p style="margin-top:16px;">If you did not expect this invitation, you can safely ignore this email.</p>
@endcomponent
