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
            ],
        );
    }
}
