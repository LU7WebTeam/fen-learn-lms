<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_blocked_lesson_redirects_to_its_prerequisite(): void
    {
        [$learner, $course, $prerequisiteLesson, $lockedLesson] = $this->createCourseWithPrerequisiteLessons();

        $response = $this
            ->actingAs($learner)
            ->get(route('learn.lesson', [$course->slug, $lockedLesson->id]));

        $response
            ->assertRedirect(route('learn.lesson', [$course->slug, $prerequisiteLesson->id], false))
            ->assertSessionHas('error', 'Complete the prerequisite lesson before accessing that lesson.');
    }

    public function test_blocked_lesson_cannot_be_marked_complete(): void
    {
        [$learner, $course, $prerequisiteLesson, $lockedLesson, $enrollment] = $this->createCourseWithPrerequisiteLessons(includeEnrollment: true);

        $response = $this
            ->actingAs($learner)
            ->post(route('learn.complete', [$course->slug, $lockedLesson->id]));

        $response
            ->assertRedirect(route('learn.lesson', [$course->slug, $prerequisiteLesson->id], false))
            ->assertSessionHas('error', 'Complete the prerequisite lesson before accessing that lesson.');

        $this->assertDatabaseMissing('lesson_progress', [
            'user_id' => $learner->id,
            'lesson_id' => $lockedLesson->id,
            'enrollment_id' => $enrollment->id,
        ]);
    }

    public function test_completed_prerequisite_allows_access_to_dependent_lesson(): void
    {
        [$learner, $course, $prerequisiteLesson, $lockedLesson, $enrollment] = $this->createCourseWithPrerequisiteLessons(includeEnrollment: true);

        LessonProgress::create([
            'user_id' => $learner->id,
            'lesson_id' => $prerequisiteLesson->id,
            'enrollment_id' => $enrollment->id,
            'completed_at' => now(),
        ]);

        $response = $this
            ->actingAs($learner)
            ->get(route('learn.lesson', [$course->slug, $lockedLesson->id]));

        $response->assertOk();
    }

    private function createCourseWithPrerequisiteLessons(bool $includeEnrollment = true): array
    {
        $creator = User::factory()->create([
            'role' => 'super_admin',
            'profile_completed_at' => now(),
        ]);

        $learner = User::factory()->create([
            'profile_completed_at' => now(),
        ]);

        $course = Course::create([
            'title' => 'Prerequisite Course',
            'slug' => 'prerequisite-course',
            'status' => 'published',
            'created_by' => $creator->id,
        ]);

        $section = Section::create([
            'course_id' => $course->id,
            'title' => 'Section 1',
            'order' => 1,
        ]);

        $prerequisiteLesson = Lesson::create([
            'section_id' => $section->id,
            'title' => 'Lesson 1',
            'type' => 'text',
            'content' => 'Intro lesson',
            'order' => 1,
        ]);

        $lockedLesson = Lesson::create([
            'section_id' => $section->id,
            'title' => 'Lesson 2',
            'type' => 'text',
            'content' => 'Dependent lesson',
            'order' => 2,
            'prerequisite_lesson_id' => $prerequisiteLesson->id,
        ]);

        $enrollment = null;

        if ($includeEnrollment) {
            $enrollment = Enrollment::create([
                'user_id' => $learner->id,
                'course_id' => $course->id,
            ]);
        }

        return [$learner, $course, $prerequisiteLesson, $lockedLesson, $enrollment];
    }
}