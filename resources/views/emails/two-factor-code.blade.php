@component('emails.partials.branded-layout', [
    'title' => $title,
    'platformName' => $branding['platformName'] ?? config('app.name'),
    'logoUrl' => $branding['logoUrl'] ?? null,
    'theme' => $branding['theme'] ?? [],
])
    <h2>{{ $title }}</h2>
    @if (!empty($titleBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $titleBM }}</p>
    @endif
    
    <p>Hello {{ $user->name }},</p>
    <p>{{ $bodyText }}</p>
    @if (!empty($bodyTextBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $bodyTextBM }}</p>
    @endif

    <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
            {{ $code }}
        </div>
    </div>

    <p>{{ $expiryText }}</p>
    @if (!empty($expiryTextBM))
        <p style="font-style: italic; font-size: 0.9em; color: #666;">{{ $expiryTextBM }}</p>
    @endif

    <div class="meta">
        <p><strong>Account:</strong> {{ $user->email }}</p>
        <p style="margin-top: 6px; color: #999; font-size: 12px;">{{ $securityNote }}</p>
        @if (!empty($securityNoteBM))
            <p style="margin-top: 6px; color: #999; font-size: 12px; font-style: italic;">{{ $securityNoteBM }}</p>
        @endif
    </div>
@endcomponent
