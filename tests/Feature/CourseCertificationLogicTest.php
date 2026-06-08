<?php

namespace Tests\Feature;

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\LearnController;
use App\Models\Course;
use App\Models\CourseCertification;
use App\Models\Enrollment;
use App\Models\EnrollmentCertification;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;
use ReflectionMethod;
use Tests\TestCase;

class CourseCertificationLogicTest extends TestCase
{
    private function createCourseWithCertifications(User $creator, string $suffix, array $certifications): Course
    {
        $relation = \Mockery::mock(HasMany::class);
        $relation->shouldReceive('where')
            ->with('is_active', true)
            ->andReturnSelf();
        $relation->shouldReceive('get')
            ->andReturn(collect(array_map(function (array $certification) {
                return new CourseCertification(array_merge([
                    'course_id' => 1,
                    'is_active' => true,
                    'requirements_json' => [
                        'type' => 'all_lessons',
                        'percentage' => 80,
                        'section_ids' => [],
                        'lesson_ids' => [],
                    ],
                    'template_json' => Course::defaultCertificateTemplate(),
                    'conditions_json' => CourseCertification::defaultConditions(),
                ], $certification));
            }, $certifications)));

        $course = \Mockery::mock(Course::class)->makePartial();
        $course->shouldReceive('certifications')
            ->andReturn($relation);

        return $course;
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }

    private function resolveCertification(User $user, Course $course): array
    {
        $controller = app(LearnController::class);
        $method = new ReflectionMethod($controller, 'resolveCertificationContext');
        $method->setAccessible(true);

        return $method->invoke($controller, $user, $course);
    }

    private function resolveCertificateTemplateContext(Enrollment $enrollment, ?EnrollmentCertification $issued = null): array
    {
        $controller = app(CertificateController::class);
        $method = new ReflectionMethod($controller, 'resolveCertificateTemplateContext');
        $method->setAccessible(true);

        return $method->invoke($controller, $enrollment, $issued);
    }

    public function test_matching_certification_is_selected_when_conditions_match(): void
    {
        $creator = new User();
        $learner = new User([
            'occupation' => 'student',
            'state' => 'Selangor',
        ]);

        $course = $this->createCourseWithCertifications($creator, 'match', [
            [
                'name' => 'Specific Certificate',
                'code' => 'specific',
                'priority' => 1,
                'conditions_json' => [
                    'occupation' => [
                        'enabled' => true,
                        'values' => ['student'],
                    ],
                    'organization' => [
                        'enabled' => false,
                        'mode' => 'exact',
                        'values' => [],
                    ],
                    'state' => [
                        'enabled' => true,
                        'values' => ['Selangor'],
                    ],
                    'age' => [
                        'enabled' => false,
                        'min' => null,
                        'max' => null,
                    ],
                ],
            ],
            [
                'name' => 'Default Certificate',
                'code' => 'default',
                'priority' => 100,
            ],
        ]);

        [$certification] = $this->resolveCertification($learner, $course);

        $this->assertNotNull($certification);
        $this->assertSame('specific', $certification->code);
    }

    public function test_default_certification_is_used_when_no_conditions_match(): void
    {
        $creator = new User();
        $learner = new User([
            'occupation' => 'government',
            'state' => 'Johor',
        ]);

        $course = $this->createCourseWithCertifications($creator, 'fallback', [
            [
                'name' => 'Narrow Certificate',
                'code' => 'narrow',
                'priority' => 1,
                'conditions_json' => [
                    'occupation' => [
                        'enabled' => true,
                        'values' => ['student'],
                    ],
                    'organization' => [
                        'enabled' => false,
                        'mode' => 'exact',
                        'values' => [],
                    ],
                    'state' => [
                        'enabled' => true,
                        'values' => ['Selangor'],
                    ],
                    'age' => [
                        'enabled' => false,
                        'min' => null,
                        'max' => null,
                    ],
                ],
            ],
            [
                'name' => 'Default Certificate',
                'code' => 'default',
                'priority' => 100,
            ],
        ]);

        [$certification] = $this->resolveCertification($learner, $course);

        $this->assertNotNull($certification);
        $this->assertSame('default', $certification->code);
    }

    public function test_certificate_display_prefers_current_profile_match_over_issued_snapshot(): void
    {
        $creator = new User();
        $learner = new User([
            'occupation' => 'student',
            'state' => 'Selangor',
        ]);

        $course = $this->createCourseWithCertifications($creator, 'display', [
            [
                'name' => 'Old Certificate',
                'code' => 'old',
                'priority' => 1,
                'template_json' => ['name' => 'old-template'],
                'conditions_json' => [
                    'occupation' => [
                        'enabled' => true,
                        'values' => ['government'],
                    ],
                    'organization' => [
                        'enabled' => false,
                        'mode' => 'exact',
                        'values' => [],
                    ],
                    'state' => [
                        'enabled' => true,
                        'values' => ['Johor'],
                    ],
                    'age' => [
                        'enabled' => false,
                        'min' => null,
                        'max' => null,
                    ],
                ],
            ],
            [
                'name' => 'New Certificate',
                'code' => 'new',
                'priority' => 2,
                'template_json' => ['name' => 'new-template'],
                'conditions_json' => [
                    'occupation' => [
                        'enabled' => true,
                        'values' => ['student'],
                    ],
                    'organization' => [
                        'enabled' => false,
                        'mode' => 'exact',
                        'values' => [],
                    ],
                    'state' => [
                        'enabled' => true,
                        'values' => ['Selangor'],
                    ],
                    'age' => [
                        'enabled' => false,
                        'min' => null,
                        'max' => null,
                    ],
                ],
            ],
            [
                'name' => 'Default Certificate',
                'code' => 'default',
                'priority' => 100,
                'template_json' => ['name' => 'default-template'],
            ],
        ]);

        $enrollment = new Enrollment();
        $enrollment->setRelation('user', $learner);
        $enrollment->setRelation('course', $course);

        $issued = new EnrollmentCertification([
            'template_snapshot_json' => ['name' => 'old-issued-template'],
        ]);

        $context = $this->resolveCertificateTemplateContext($enrollment, $issued);

        $this->assertSame('new', $context['selected']->code);
        $this->assertSame('new-template', $context['template']['name']);
    }
}