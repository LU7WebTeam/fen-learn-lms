<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class ActivityLogExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_export_activity_logs_as_csv(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('updated')
            ->withProperties([
                'updated_fields' => ['title', 'description'],
                'reason' => 'Bulk edit',
                'old_role' => 'content_editor',
                'new_role' => 'super_admin',
            ])
            ->log('Updated profile');

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');

        $content = $response->streamedContent();

        $this->assertStringContainsString('timestamp,actor_name,actor_email,event,description,subject_type,subject_id,changed_fields,reason,old_role,new_role,source_course_id,source_section_id,source_lesson_id', $content);
        $this->assertStringContainsString('Updated profile', $content);
        $this->assertStringContainsString('updated', $content);
        $this->assertStringContainsString('title|description', $content);
    }

    public function test_non_admin_cannot_export_activity_logs(): void
    {
        $learner = User::factory()->create([
            'role' => 'learner',
        ]);

        $response = $this
            ->actingAs($learner)
            ->get(route('admin.activity-logs.export'));

        $response->assertForbidden();
    }

    public function test_admin_can_export_activity_logs_as_json(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('updated')
            ->log('Updated json payload');

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export-json'));

        $response->assertOk();
        $response->assertJsonStructure([
            'exported_at',
            'filters',
            'count',
            'data' => [
                '*' => [
                    'timestamp',
                    'actor_name',
                    'actor_email',
                    'event',
                    'description',
                    'subject_type',
                    'subject_id',
                    'changed_fields',
                    'reason',
                    'old_role',
                    'new_role',
                    'source_course_id',
                    'source_section_id',
                    'source_lesson_id',
                ],
            ],
        ]);

        $response->assertJsonPath('data.0.description', 'Updated json payload');
    }

    public function test_non_admin_cannot_export_activity_logs_as_json(): void
    {
        $learner = User::factory()->create([
            'role' => 'learner',
        ]);

        $response = $this
            ->actingAs($learner)
            ->get(route('admin.activity-logs.export-json'));

        $response->assertForbidden();
    }

    public function test_export_respects_event_filter(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('updated')
            ->log('Updated course');

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('deleted')
            ->log('Deleted course');

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export', [
                'event' => 'deleted',
            ]));

        $response->assertOk();

        $content = $response->streamedContent();

        $this->assertStringContainsString('Deleted course', $content);
        $this->assertStringNotContainsString('Updated course', $content);
    }

    public function test_json_export_respects_event_filter(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('updated')
            ->log('Updated from json filter test');

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('deleted')
            ->log('Deleted from json filter test');

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export-json', [
                'event' => 'deleted',
            ]));

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.description', 'Deleted from json filter test');
    }

    public function test_export_respects_causer_filter(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $otherAdmin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        activity('admin')
            ->causedBy($admin)
            ->performedOn($admin)
            ->event('updated')
            ->log('Updated own profile');

        activity('admin')
            ->causedBy($otherAdmin)
            ->performedOn($otherAdmin)
            ->event('updated')
            ->log('Updated another profile');

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export', [
                'causer_id' => $otherAdmin->id,
            ]));

        $response->assertOk();

        $content = $response->streamedContent();

        $this->assertStringContainsString('Updated another profile', $content);
        $this->assertStringNotContainsString('Updated own profile', $content);
    }

    public function test_export_respects_subject_type_filter(): void
    {
        $admin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $subjectUser = User::factory()->create();

        activity('admin')
            ->causedBy($admin)
            ->performedOn($subjectUser)
            ->event('updated')
            ->log('Updated user subject');

        Activity::query()->create([
            'log_name' => 'admin',
            'description' => 'System maintenance note',
            'event' => 'updated',
            'causer_id' => null,
            'causer_type' => null,
            'subject_id' => null,
            'subject_type' => null,
            'properties' => [],
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.activity-logs.export', [
                'subject_type' => User::class,
            ]));

        $response->assertOk();

        $content = $response->streamedContent();

        $this->assertStringContainsString('Updated user subject', $content);
        $this->assertStringNotContainsString('System maintenance note', $content);
    }
}
