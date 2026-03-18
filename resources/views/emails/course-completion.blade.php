@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>{{ $emailTitle }}</h2>
    <p>Hi {{ $greetingName }},</p>

    @foreach($bodyLines as $line)
        <p>{{ $line }}</p>
    @endforeach

    @if(!empty($ctaUrl))
        <div class="button-wrap">
            <a href="{{ $ctaUrl }}" class="button">{{ $emailCta }}</a>
        </div>

        <p style="font-size:13px;color:{{ $theme['mutedText'] }};">If the button does not work, copy and paste this URL into your browser:</p>
        <p class="url-fallback">{{ $ctaUrl }}</p>
    @endif

    <div class="meta">
        <p><strong>Course:</strong> {{ $courseTitle }}</p>
        <p style="margin-top:6px;"><strong>Learner:</strong> {{ $learnerName }}</p>
        <p style="margin-top:6px;"><strong>Completed at:</strong> {{ $completedAt }}</p>
        <p style="margin-top:6px;"><strong>Certificate:</strong> {{ $certificateAvailable ? 'Issued' : 'Not issued' }}</p>
    </div>
@endcomponent
