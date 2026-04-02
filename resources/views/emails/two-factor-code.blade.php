@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $branding['platformName'] ?? config('app.name'),
    'logoUrl' => $branding['logoUrl'] ?? null,
    'theme' => $branding['theme'] ?? [],
])
    <h2>{{ $titleBM ?: $title }}</h2>
    @if (!empty($titleBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $title }}</p>
    @endif
    
    <p>{{ $greetingLabelBM ?: $greetingLabel }} {{ $user->name }},</p>
    <p>{{ $bodyTextBM ?: $bodyText }}</p>
    @if (!empty($bodyTextBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $bodyText }}</p>
    @endif

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
            {{ $code }}
        </div>
    </div>

    <p>{{ $expiryTextBM ?: $expiryText }}</p>
    @if (!empty($expiryTextBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $expiryText }}</p>
    @endif

    <div class="meta">
        <p><strong>{{ $accountLabelBM ?: $accountLabel }}:</strong> {{ $user->email }}</p>
        <p style="margin-top: 6px; color: #999; font-size: 12px;">{{ $securityNoteBM ?: $securityNote }}</p>
        @if (!empty($securityNoteBM))
            <p style="margin-top: 6px; color: #999; font-size: 12px; font-style: italic;">{{ $securityNote }}</p>
        @endif
    </div>
@endcomponent
