<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class CourseCompletionNotifier
{
    public static function send(User $learner, Course $course, Enrollment $enrollment): void
    {
        $notifyLearner = Setting::get('course_completion_notify_learner', '1') === '1';
        $notifyAdmins = Setting::get('course_completion_notify_admins', '0') === '1';
        $certificateAvailable = filled($enrollment->certificate_uuid);

        if ($notifyLearner && filled($learner->email)) {
            self::sendLearnerEmail($learner, $course, $enrollment, $certificateAvailable);
        }

        if ($notifyAdmins) {
            self::sendAdminEmails($learner, $course, $enrollment, $certificateAvailable);
        }
    }

    private static function sendLearnerEmail(User $learner, Course $course, Enrollment $enrollment, bool $certificateAvailable): void
    {
        $branding = EmailBranding::data();
        $courseUrl = route('learn.index', ['course' => $course->slug]);
        $tokens = [
            'platform_name' => $branding['platformName'],
            'learner_name' => $learner->name,
            'course_title' => $course->title,
            'completed_at' => $enrollment->completed_at?->format('M j, Y g:i A') ?? now()->format('M j, Y g:i A'),
            'certificate_status' => $certificateAvailable ? 'Issued' : 'Not issued',
        ];

        $tokenMap = [];
        foreach ($tokens as $key => $value) {
            $tokenMap['{{'.$key.'}}'] = (string) $value;
        }

        $bodyEnFallback = 'Congratulations {{learner_name}} on completing {{course_title}} on {{platform_name}}.';
        $titleEnFallback = 'You completed a course';
        $ctaEnFallback = $certificateAvailable ? 'Open Course Page' : 'Continue Learning';

        $body = EmailContent::get(
            'course_completion_email_body',
            $bodyEnFallback,
            $tokens
        );

        $bodyBM = EmailContent::get(
            'course_completion_email_body_bm',
            'Tahniah {{learner_name}} kerana telah menyelesaikan {{course_title}} di {{platform_name}}.',
            $tokens
        );

        if (trim($body) === trim($bodyBM)) {
            $body = strtr($bodyEnFallback, $tokenMap);
        }

        $title = EmailContent::get('course_completion_email_title', $titleEnFallback, $tokens);
        $titleBM = EmailContent::get('course_completion_email_title_bm', 'Anda telah menyelesaikan sebuah kursus', $tokens);
        if (trim($title) === trim($titleBM)) {
            $title = $titleEnFallback;
        }

        $emailCta = EmailContent::get('course_completion_email_cta', $ctaEnFallback, $tokens);
        $emailCtaBM = EmailContent::get('course_completion_email_cta_bm', $certificateAvailable ? 'Buka Halaman Kursus' : 'Teruskan Pembelajaran', $tokens);
        if (trim($emailCta) === trim($emailCtaBM)) {
            $emailCta = $ctaEnFallback;
        }

        $bodyLines = preg_split('/\r\n|\r|\n/', $body) ?: [$body];
        $bodyLines = array_values(array_filter(array_map('trim', $bodyLines), fn($line) => $line !== ''));

        $bodyLinesBM = preg_split('/\r\n|\r|\n/', $bodyBM) ?: [$bodyBM];
        $bodyLinesBM = array_values(array_filter(array_map('trim', $bodyLinesBM), fn($line) => $line !== ''));

        if (empty($bodyLines)) {
            $bodyLines = ["Congratulations on completing {$course->title} on {$branding['platformName']}."];
        }

        if (empty($bodyLinesBM)) {
            $bodyLinesBM = ["Tahniah kerana telah menyelesaikan {$course->title} di {$branding['platformName']}." ];
        }

        $bodyLines[] = 'Your learning progress has been successfully recorded.';
        $bodyLinesBM[] = 'Kemajuan pembelajaran anda telah berjaya direkodkan.';

        if ($certificateAvailable) {
            $bodyLines[] = 'Your certificate is ready. Open the course page to view and download it.';
            $bodyLinesBM[] = 'Sijil anda telah siap. Sila buka halaman kursus untuk melihat dan memuat turunnya.';
        }

        self::deliver(
            $learner->email,
            EmailContent::get('course_completion_email_subject', 'Kursus selesai: {{course_title}}', $tokens),
            [
                ...$branding,
                'title' => $title,
                'emailTitle' => $title,
                'titleBM' => $titleBM,
                'greetingName' => $learner->name,
                'bodyLines' => $bodyLines,
                'bodyLinesBM' => $bodyLinesBM,
                'emailCta' => $emailCta,
                'emailCtaBM' => $emailCtaBM,
                'ctaUrl' => $courseUrl,
                'courseTitle' => $course->title,
                'learnerName' => $learner->name,
                'completedAt' => $tokens['completed_at'],
                'certificateAvailable' => $certificateAvailable,
            ]
        );
    }

    private static function sendAdminEmails(User $learner, Course $course, Enrollment $enrollment, bool $certificateAvailable): void
    {
        $configuredRecipients = collect(explode(',', (string) Setting::get('course_completion_admin_recipients', '')))
            ->map(fn($email) => trim($email))
            ->filter()
            ->values();

        $fallbackRecipients = User::query()
            ->get(['name', 'email', 'role'])
            ->filter(fn(User $user) => $user->isAdmin() && filled($user->email))
            ->pluck('email');

        $recipients = $configuredRecipients->isNotEmpty()
            ? $configuredRecipients
            : $fallbackRecipients;

        if ($recipients->isEmpty()) {
            return;
        }

        $branding = EmailBranding::data();
        $adminUrl = route('admin.courses.edit', ['course' => $course->slug, 'tab' => 'learner-profiles']);
        $completedAt = $enrollment->completed_at?->format('M j, Y g:i A') ?? now()->format('M j, Y g:i A');

        foreach ($recipients->unique() as $recipient) {
            self::deliver(
                $recipient,
                "Learner completed course: {$course->title}",
                [
                    ...$branding,
                    'title' => 'Course Completion Alert',
                    'emailTitle' => 'A learner completed a course',
                    'greetingName' => 'Admin',
                    'bodyLines' => [
                        "{$learner->name} ({$learner->email}) has completed {$course->title}.",
                        $certificateAvailable
                            ? 'A certificate was issued for this completion.'
                            : 'No certificate was issued for this course completion.',
                    ],
                    'emailCta' => 'Open Course Admin',
                    'ctaUrl' => $adminUrl,
                    'courseTitle' => $course->title,
                    'learnerName' => $learner->name,
                    'completedAt' => $completedAt,
                    'certificateAvailable' => $certificateAvailable,
                ]
            );
        }
    }

    private static function deliver(string $recipient, string $subject, array $data): void
    {
        try {
            Mail::send('emails.course-completion', $data, function ($message) use ($recipient, $subject) {
                $message->to($recipient)->subject($subject);
            });
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
