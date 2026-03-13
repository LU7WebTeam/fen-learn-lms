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
            "You've been invited to join {{platform_name}}",
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
        ];

        $branding = EmailBranding::data();

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
                'emailTitle'   => EmailContent::get(
                    'invitation_email_title',
                    "You're invited to join the team",
                    [
                        'platform_name' => $branding['platformName'],
                    ],
                ),
                'emailBody'    => EmailContent::get(
                    'invitation_email_body',
                    '{{inviter_name}} has invited you to join {{platform_name}} as a {{role_label}}.',
                    [
                        'inviter_name' => $this->invitation->inviter->name ?? 'An administrator',
                        'platform_name' => $branding['platformName'],
                        'role_label' => $roleLabels[$this->invitation->role] ?? $this->invitation->role,
                    ],
                ),
                'emailCta'     => EmailContent::get(
                    'invitation_email_cta',
                    'Accept Invitation',
                    [
                        'platform_name' => $branding['platformName'],
                    ],
                ),
            ],
        );
    }
}
