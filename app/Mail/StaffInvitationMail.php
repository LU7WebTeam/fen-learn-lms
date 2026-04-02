<?php

namespace App\Mail;

use App\Models\StaffInvitation;
use App\Models\Setting;
use App\Support\EmailBranding;
use App\Support\EmailContent;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly StaffInvitation $invitation,
    ) {}

    public function envelope(): Envelope
    {
        $platform = Setting::get('platform_name', config('app.name'));
        $subject = EmailContent::get(
            'invitation_email_subject',
            'Anda telah dijemput untuk menyertai {{platform_name}}',
            [
                'platform_name' => $platform,
            ],
        );

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        $roleLabels = [
            'content_editor' => 'Content Editor',
            'super_admin'    => 'Super Admin',
            'course_viewer'  => 'Course Viewer',
        ];

        $branding = EmailBranding::data();
        $tokenMap = [
            '{{inviter_name}}' => (string) ($this->invitation->inviter->name ?? 'An administrator'),
            '{{platform_name}}' => (string) $branding['platformName'],
            '{{role_label}}' => (string) ($roleLabels[$this->invitation->role] ?? $this->invitation->role),
        ];

        $titleEnFallback = "You're invited to join the team";
        $bodyEnFallback = '{{inviter_name}} has invited you to join {{platform_name}} as a {{role_label}}.';
        $ctaEnFallback = 'Accept Invitation';

        $emailTitle = EmailContent::get(
            'invitation_email_title',
            $titleEnFallback,
            [
                'platform_name' => $branding['platformName'],
            ],
        );

        $emailBody = EmailContent::get(
            'invitation_email_body',
            $bodyEnFallback,
            [
                'inviter_name' => $this->invitation->inviter->name ?? 'An administrator',
                'platform_name' => $branding['platformName'],
                'role_label' => $roleLabels[$this->invitation->role] ?? $this->invitation->role,
            ],
        );

        $emailCta = EmailContent::get(
            'invitation_email_cta',
            $ctaEnFallback,
            [
                'platform_name' => $branding['platformName'],
            ],
        );

        $emailTitleBM = EmailContent::get(
            'invitation_email_title_bm',
            'Anda dijemput untuk bergabung dengan pasukan',
            [
                'platform_name' => $branding['platformName'],
            ],
        );

        $emailBodyBM = EmailContent::get(
            'invitation_email_body_bm',
            '{{inviter_name}} telah menjemput anda untuk bergabung dengan {{platform_name}} sebagai {{role_label}}.',
            [
                'inviter_name' => $this->invitation->inviter->name ?? 'An administrator',
                'platform_name' => $branding['platformName'],
                'role_label' => $roleLabels[$this->invitation->role] ?? $this->invitation->role,
            ],
        );

        $emailCtaBM = EmailContent::get(
            'invitation_email_cta_bm',
            'Terima Jemputan',
            [
                'platform_name' => $branding['platformName'],
            ],
        );

        $emailTitle = EmailContent::resolveSecondaryEnglish($emailTitle, $emailTitleBM, $titleEnFallback, [
            'platform_name' => $branding['platformName'],
        ]);

        $emailBody = EmailContent::resolveSecondaryEnglish($emailBody, $emailBodyBM, $bodyEnFallback, [
            'inviter_name' => $this->invitation->inviter->name ?? 'An administrator',
            'platform_name' => $branding['platformName'],
            'role_label' => $roleLabels[$this->invitation->role] ?? $this->invitation->role,
        ]);

        $emailCta = EmailContent::resolveSecondaryEnglish($emailCta, $emailCtaBM, $ctaEnFallback, [
            'platform_name' => $branding['platformName'],
        ]);

        // Get label translations
        $greetingEnFallback = 'Hi there,';
        $greetingLabel = EmailContent::get('invitation_email_greeting', $greetingEnFallback, []);
        $greetingLabelBM = EmailContent::get('invitation_email_greeting_bm', 'Hai,', []);

        $instructionEnFallback = 'Click the button below to set up your account. The link is valid until {{expires_at}}.';
        $instructionLabel = EmailContent::get('invitation_email_instruction', $instructionEnFallback, ['expires_at' => $this->invitation->expires_at->format('d M Y')]);
        $instructionLabelBM = EmailContent::get('invitation_email_instruction_bm', 'Klik butang di bawah untuk menyediakan akaun anda. Pautan ini sah sehingga {{expires_at}}.', ['expires_at' => $this->invitation->expires_at->format('d M Y')]);

        $buttonFallbackEnFallback = 'If the button does not work, copy and paste this URL into your browser:';
        $buttonFallbackLabel = EmailContent::get('invitation_email_button_fallback', $buttonFallbackEnFallback, []);
        $buttonFallbackLabelBM = EmailContent::get('invitation_email_button_fallback_bm', 'Jika butang tidak berfungsi, salin dan tampal URL ini ke pelayar anda:', []);

        $invitedAsEnFallback = 'Invited as';
        $invitedAsLabel = EmailContent::get('invitation_email_invited_as_label', $invitedAsEnFallback, []);
        $invitedAsLabelBM = EmailContent::get('invitation_email_invited_as_label_bm', 'Dijemput sebagai', []);

        $expiresEnFallback = 'Expires';
        $expiresLabel = EmailContent::get('invitation_email_expires_label', $expiresEnFallback, []);
        $expiresLabelBM = EmailContent::get('invitation_email_expires_label_bm', 'Tamat tempoh', []);

        $ignoreEnFallback = 'If you did not expect this invitation, you can safely ignore this email.';
        $ignoreLabel = EmailContent::get('invitation_email_ignore', $ignoreEnFallback, []);
        $ignoreLabelBM = EmailContent::get('invitation_email_ignore_bm', 'Jika anda tidak menjangkakan jemputan ini, anda boleh mengabaikan e-mel ini dengan selamat.', []);

        return new Content(
            view: 'emails.staff-invitation',
            with: [
                'invitation'   => $this->invitation,
                'acceptUrl'    => route('invitations.show', $this->invitation->token),
                'platformName' => $branding['platformName'],
                'roleLabel'    => $roleLabels[$this->invitation->role] ?? $this->invitation->role,
                'inviterName'  => $this->invitation->inviter->name ?? 'An administrator',
                'expiresAt'    => $this->invitation->expires_at->format('d M Y'),
                'logoUrl'      => $branding['logoUrl'],
                'theme'        => $branding['theme'],
                'emailTitle'   => $emailTitle,
                'emailBody'    => $emailBody,
                'emailCta'     => $emailCta,
                'emailTitleBM' => $emailTitleBM,
                'emailBodyBM'  => $emailBodyBM,
                'emailCtaBM'   => $emailCtaBM,
                'greetingLabel' => $greetingLabel,
                'greetingLabelBM' => $greetingLabelBM,
                'instructionLabel' => $instructionLabel,
                'instructionLabelBM' => $instructionLabelBM,
                'buttonFallbackLabel' => $buttonFallbackLabel,
                'buttonFallbackLabelBM' => $buttonFallbackLabelBM,
                'invitedAsLabel' => $invitedAsLabel,
                'invitedAsLabelBM' => $invitedAsLabelBM,
                'expiresLabel' => $expiresLabel,
                'expiresLabelBM' => $expiresLabelBM,
                'ignoreLabel' => $ignoreLabel,
                'ignoreLabelBM' => $ignoreLabelBM,
            ],
        );
    }
}
