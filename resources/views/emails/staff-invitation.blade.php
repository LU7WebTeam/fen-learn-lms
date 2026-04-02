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
    
    <p>{{ $greetingLabelBM ?: $greetingLabel }}</p>
    <p>{!! nl2br(e($emailBodyBM ?: $emailBody)) !!}</p>
    @if (!empty($emailBodyBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{!! nl2br(e($emailBody)) !!}</p>
    @endif
    
    <p>{{ $instructionLabelBM ?: $instructionLabel }}</p>

    <div class="button-wrap">
        <a href="{{ $acceptUrl }}" class="button">{{ $emailCtaBM ?: $emailCta }}</a>
        @if (!empty($emailCtaBM))
            <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 4px;">{{ $emailCta }}</p>
        @endif
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">{{ $buttonFallbackLabelBM ?: $buttonFallbackLabel }}</p>
    <p class="url-fallback">{{ $acceptUrl }}</p>

    <div class="meta">
        <p><strong>{{ $invitedAsLabelBM ?: $invitedAsLabel }}:</strong> {{ $roleLabel }}</p>
        <p style="margin-top:6px;"><strong>{{ $expiresLabelBM ?: $expiresLabel }}:</strong> {{ $expiresAt }}</p>
    </div>

    <p style="margin-top:16px;">{{ $ignoreLabelBM ?: $ignoreLabel }}</p>
@endcomponent
