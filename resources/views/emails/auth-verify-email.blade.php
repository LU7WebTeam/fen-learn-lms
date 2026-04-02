@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $titleBM ?: $title }}</h2>
    @if (!empty($titleBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $title }}</p>
    @endif
    
    <p>{{ $greetingLabelBM ?: $greetingLabel }}</p>
    <p>{!! nl2br(e($bodyTextBM ?: $bodyText)) !!}</p>
    @if (!empty($bodyTextBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{!! nl2br(e($bodyText)) !!}</p>
    @endif

    <div class="button-wrap">
        <a href="{{ $actionUrl }}" class="button">{{ $actionTextBM ?: $actionText }}</a>
        @if (!empty($actionTextBM))
            <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 4px;">{{ $actionText }}</p>
        @endif
    </div>

    <p style="font-size:13px;color:{{ $theme['mutedText'] }};">{{ $buttonFallbackLabelBM ?: $buttonFallbackLabel }}</p>
    <p class="url-fallback">{{ $actionUrl }}</p>

    <div class="meta">
        <p><strong>{{ $accountLabelBM ?: $accountLabel }}:</strong> {{ $email }}</p>
        <p style="margin-top:6px;"><strong>{{ $expiresInLabelBM ?: $expiresInLabel }}:</strong> {{ $expiresInMinutes }} minutes</p>
    </div>
@endcomponent
