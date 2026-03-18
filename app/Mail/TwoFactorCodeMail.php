<?php

namespace App\Mail;

use App\Models\User;
use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your login verification code',
        );
    }

    public function content(): Content
    {
        $branding = EmailBranding::data();

        return new Content(
            view: 'emails.two-factor-code',
            with: [
                'user' => $this->user,
                'code' => $this->code,
                'branding' => $branding,
            ],
        );
    }
}
