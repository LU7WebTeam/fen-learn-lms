@component('emails.partials.branded-layout', [
    'title' => 'SMTP Test Email',
    'platformName' => $platformName,
    'logoUrl' => $logoUrl,
    'theme' => $theme,
])
    <h2>SMTP Test Email</h2>
    <p>This is a test email from <strong>{{ $host }}</strong>.</p>
    <p>Sent at: <strong>{{ $sentAt }}</strong></p>

    <div class="meta">
        <p><strong>Status:</strong> Mail configuration appears operational.</p>
    </div>
@endcomponent
