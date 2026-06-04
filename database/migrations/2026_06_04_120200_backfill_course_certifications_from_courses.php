<?php

use App\Models\Course;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaultRequirements = [
            'type' => 'all_lessons',
            'percentage' => 80,
            'section_ids' => [],
            'lesson_ids' => [],
        ];

        $defaultConditions = [
            'occupation' => [
                'enabled' => false,
                'values' => [],
            ],
            'organization' => [
                'enabled' => false,
                'mode' => 'exact',
                'values' => [],
            ],
            'state' => [
                'enabled' => false,
                'values' => [],
            ],
            'age' => [
                'enabled' => false,
                'min' => null,
                'max' => null,
            ],
        ];

        DB::table('courses')
            ->select(['id', 'certificate_template', 'created_at', 'updated_at'])
            ->orderBy('id')
            ->chunkById(200, function ($courses) use ($defaultRequirements, $defaultConditions) {
                foreach ($courses as $course) {
                    $alreadySeeded = DB::table('course_certifications')
                        ->where('course_id', $course->id)
                        ->exists();

                    if ($alreadySeeded) {
                        continue;
                    }

                    $template = $course->certificate_template;
                    if (is_string($template)) {
                        $template = json_decode($template, true);
                    }

                    if (!is_array($template) || $template === []) {
                        $template = Course::defaultCertificateTemplate();
                    }

                    $requirements = $template['requirements'] ?? $defaultRequirements;

                    DB::table('course_certifications')->insert([
                        'course_id' => $course->id,
                        'name' => 'Default Certificate',
                        'code' => 'default',
                        'is_active' => true,
                        'priority' => 100,
                        'conditions_json' => json_encode($defaultConditions, JSON_UNESCAPED_SLASHES),
                        'template_json' => json_encode($template, JSON_UNESCAPED_SLASHES),
                        'requirements_json' => json_encode($requirements, JSON_UNESCAPED_SLASHES),
                        'created_at' => $course->created_at ?? now(),
                        'updated_at' => $course->updated_at ?? now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        DB::table('course_certifications')->where('code', 'default')->delete();
    }
};
