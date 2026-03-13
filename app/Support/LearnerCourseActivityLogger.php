<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class LearnerCourseActivityLogger
{
    public static function record(
        User $learner,
        Course $course,
        Enrollment $enrollment,
        string $event,
        string $description,
        array $properties = [],
        ?Model $subject = null,
    ): void {
        $baseProperties = [
            'course_id' => $course->id,
            'course_title' => $course->title,
            'enrollment_id' => $enrollment->id,
        ];

        if ($subject instanceof Lesson) {
            $baseProperties['lesson_id'] = $subject->id;
            $baseProperties['lesson_title'] = $subject->title;
            $baseProperties['section_id'] = $subject->section_id;
            $baseProperties['lesson_type'] = $subject->type;
        }

        $logger = activity('learner_course')
            ->causedBy($learner)
            ->event($event)
            ->withProperties(array_merge($baseProperties, $properties));

        if ($subject) {
            $logger->performedOn($subject);
        } else {
            $logger->performedOn($course);
        }

        $logger->log($description);
    }
}
