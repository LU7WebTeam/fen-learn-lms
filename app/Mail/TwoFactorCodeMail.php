<?php

namespace App\Mail;

use App\Models\User;
use App\Support\EmailBranding;
use App\Support\EmailContent;
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
        $subject = EmailContent::get(
            'two_factor_email_subject',
            'Kod pengesahan log masuk anda',
            [],
        );

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $branding = EmailBranding::data();
        $tokens = [];

        return new Content(
            view: 'emails.two-factor-code',
            with: [
                'user' => $this->user,
                'code' => $this->code,
                'branding' => $branding,
                'title' => EmailContent::get('two_factor_email_title', 'Kod Pengesahan Log Masuk', $tokens),
                'titleBM' => EmailContent::get('two_factor_email_title_bm', 'Kod Pengesahan Log Masuk', $tokens),
                'bodyText' => EmailContent::get('two_factor_email_body', 'Anda telah meminta untuk log masuk ke akaun anda. Untuk melengkapkan log masuk anda, sila gunakan kod pengesahan di bawah:', $tokens),
                'bodyTextBM' => EmailContent::get('two_factor_email_body_bm', 'Anda telah meminta untuk log masuk ke akaun anda. Untuk melengkapkan log masuk anda, sila gunakan kod pengesahan di bawah:', $tokens),
                'expiryText' => EmailContent::get('two_factor_email_expiry', 'Kod ini akan tamat tempoh dalam 10 minit.', $tokens),
                'expiryTextBM' => EmailContent::get('two_factor_email_expiry_bm', 'Kod ini akan tamat tempoh dalam 10 minit.', $tokens),
                'securityNote' => EmailContent::get('two_factor_email_security_note', 'Jika anda tidak meminta kod ini, sila abaikan e-mel ini dan pastikan akaun anda selamat.', $tokens),
                'securityNoteBM' => EmailContent::get('two_factor_email_security_note_bm', 'Jika anda tidak meminta kod ini, sila abaikan e-mel ini dan pastikan akaun anda selamat.', $tokens),
            ],
        );
    }
}
