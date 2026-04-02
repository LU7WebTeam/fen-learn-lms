@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $titleBM ?: $emailTitle }}</h2>
    @if (!empty($titleBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $emailTitle }}</p>
    @endif
    
    <p>{{ $greetingLabelBM ?: $greetingLabel }} {{ $greetingName }},</p>

    @foreach(($bodyLinesBM ?? []) ?: $bodyLines as $line)
        <p>{{ $line }}</p>
    @endforeach

    @if (!empty($bodyLinesBM))
        @foreach($bodyLines as $line)
            <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $line }}</p>
        @endforeach
    @endif

    @if(!empty($ctaUrl))
        <div class="button-wrap">
            <a href="{{ $ctaUrl }}" class="button">{{ $emailCtaBM ?: $emailCta }}</a>
            @if (!empty($emailCtaBM))
                <p style="font-style: italic; font-size: 0.9em; color: #666; margin-top: 4px;">{{ $emailCta }}</p>
            @endif
        </div>

        <p style="font-size:13px;color:{{ $theme['mutedText'] }};">{{ $buttonFallbackLabelBM ?: $buttonFallbackLabel }}</p>
        <p class="url-fallback">{{ $ctaUrl }}</p>
    @endif

    <div class="meta">
        <p><strong>{{ $courseLabelBM ?: $courseLabel }}:</strong> {{ $courseTitle }}</p>
        <p style="margin-top:6px;"><strong>{{ $learnerLabelBM ?: $learnerLabel }}:</strong> {{ $learnerName }}</p>
        <p style="margin-top:6px;"><strong>{{ $completedAtLabelBM ?: $completedAtLabel }}:</strong> {{ $completedAt }}</p>
        <p style="margin-top:6px;"><strong>{{ $certificateLabelBM ?: $certificateLabel }}:</strong> {{ $certificateAvailable ? 'Issued' : 'Not issued' }}</p>
    </div>
@endcomponent
