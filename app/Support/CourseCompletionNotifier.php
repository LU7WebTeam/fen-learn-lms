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

        $bodyLines = [
            "Congratulations on completing {$course->title} on {$branding['platformName']}.",
            'Your learning progress has been recorded successfully.',
        ];

        if ($certificateAvailable) {
            $bodyLines[] = 'Your certificate is ready. Please open the course page to view and download it.';
        }

        self::deliver(
            $learner->email,
            "Course completed: {$course->title}",
            [
                ...$branding,
                'title' => 'Course Completion',
                'emailTitle' => 'You completed a course',
                'greetingName' => $learner->name,
                'bodyLines' => $bodyLines,
                'emailCta' => $certificateAvailable ? 'Open Course Page' : 'Continue Learning',
                'ctaUrl' => $courseUrl,
                'courseTitle' => $course->title,
                'learnerName' => $learner->name,
                'completedAt' => $enrollment->completed_at?->format('M j, Y g:i A') ?? now()->format('M j, Y g:i A'),
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
        $adminUrl = route('admin.courses.edit', ['course' => $course->id, 'tab' => 'learner-profiles']);
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
