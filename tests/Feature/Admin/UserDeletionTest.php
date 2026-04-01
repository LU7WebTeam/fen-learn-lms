<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDeletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_delete_a_non_super_admin_user(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        $user = User::factory()->create(['role' => 'learner']);

        $response = $this->actingAs($superAdmin)->delete(route('admin.users.destroy', $user));

        $response->assertRedirect();
        $response->assertSessionHas('success', "{$user->name} has been deleted.");
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_non_super_admin_cannot_delete_users(): void
    {
        $editor = User::factory()->create(['role' => 'content_editor']);
        $user = User::factory()->create(['role' => 'learner']);

        $response = $this->actingAs($editor)->delete(route('admin.users.destroy', $user));

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_super_admin_cannot_delete_own_account(): void
    {
        $superAdmin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($superAdmin)->delete(route('admin.users.destroy', $superAdmin));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'You cannot delete your own account.');
        $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
    }

    public function test_super_admin_can_delete_another_super_admin_when_multiple_exist(): void
    {
        $actingSuperAdmin = User::factory()->create(['role' => 'super_admin']);
        $otherSuperAdmin = User::factory()->create(['role' => 'super_admin']);

        $response = $this->actingAs($actingSuperAdmin)->delete(route('admin.users.destroy', $otherSuperAdmin));

        $response->assertRedirect();
        $response->assertSessionHas('success', "{$otherSuperAdmin->name} has been deleted.");
        $this->assertDatabaseMissing('users', ['id' => $otherSuperAdmin->id]);
        $this->assertDatabaseHas('users', ['id' => $actingSuperAdmin->id]);
    }

    public function test_course_viewer_cannot_delete_users(): void
    {
        $courseViewer = User::factory()->create(['role' => 'course_viewer']);
        $user = User::factory()->create(['role' => 'learner']);

        $response = $this->actingAs($courseViewer)->delete(route('admin.users.destroy', $user));

        $response->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }
}
