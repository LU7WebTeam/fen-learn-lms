<?php

namespace App\Mail;

use App\Models\User;
use App\Support\EmailBranding;
use App\Support\EmailContent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable implements ShouldQueue
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

        $titleEnFallback = 'Login verification code';
        $bodyEnFallback = 'Do you want to log in to your account? Use the verification code below to log in.';
        $expiryEnFallback = 'This code will expire in 10 minutes.';
        $securityEnFallback = 'If you did not request this code, please ignore this email and secure your account.';
        $greetingEnFallback = 'Hello';
        $accountLabelEnFallback = 'Account';

        $title = EmailContent::get('two_factor_email_title', $titleEnFallback, $tokens);
        $titleBM = EmailContent::get('two_factor_email_title_bm', 'Kod Pengesahan Log Masuk', $tokens);
        $title = EmailContent::resolveSecondaryEnglish($title, $titleBM, $titleEnFallback, $tokens);

        $bodyText = EmailContent::get('two_factor_email_body', $bodyEnFallback, $tokens);
        $bodyTextBM = EmailContent::get('two_factor_email_body_bm', 'Anda ingin log masuk ke akaun anda? Gunakan kod pengesahan di bawah untuk log masuk.', $tokens);
        $bodyText = EmailContent::resolveSecondaryEnglish($bodyText, $bodyTextBM, $bodyEnFallback, $tokens);

        $expiryText = EmailContent::get('two_factor_email_expiry', $expiryEnFallback, $tokens);
        $expiryTextBM = EmailContent::get('two_factor_email_expiry_bm', 'Kod ini akan tamat tempoh dalam 10 minit.', $tokens);
        $expiryText = EmailContent::resolveSecondaryEnglish($expiryText, $expiryTextBM, $expiryEnFallback, $tokens);

        $securityNote = EmailContent::get('two_factor_email_security_note', $securityEnFallback, $tokens);
        $securityNoteBM = EmailContent::get('two_factor_email_security_note_bm', 'Jika anda tidak meminta kod ini, sila abaikan e-mel ini dan pastikan akaun anda selamat.', $tokens);
        $securityNote = EmailContent::resolveSecondaryEnglish($securityNote, $securityNoteBM, $securityEnFallback, $tokens);

        $greetingLabel = EmailContent::get('two_factor_email_greeting', $greetingEnFallback, $tokens);
        $greetingLabelBM = EmailContent::get('two_factor_email_greeting_bm', 'Hai', $tokens);
        $greetingLabel = EmailContent::resolveSecondaryEnglish($greetingLabel, $greetingLabelBM, $greetingEnFallback, $tokens);

        $accountLabel = EmailContent::get('two_factor_email_account_label', $accountLabelEnFallback, $tokens);
        $accountLabelBM = EmailContent::get('two_factor_email_account_label_bm', 'Akaun', $tokens);
        $accountLabel = EmailContent::resolveSecondaryEnglish($accountLabel, $accountLabelBM, $accountLabelEnFallback, $tokens);

        return new Content(
            view: 'emails.two-factor-code',
            with: [
                'user' => $this->user,
                'code' => $this->code,
                'branding' => $branding,
                'title' => $title,
                'titleBM' => $titleBM,
                'bodyText' => $bodyText,
                'bodyTextBM' => $bodyTextBM,
                'expiryText' => $expiryText,
                'expiryTextBM' => $expiryTextBM,
                'securityNote' => $securityNote,
                'securityNoteBM' => $securityNoteBM,
                'greetingLabel' => $greetingLabel,
                'greetingLabelBM' => $greetingLabelBM,
                'accountLabel' => $accountLabel,
                'accountLabelBM' => $accountLabelBM,
            ],
        );
    }
}
