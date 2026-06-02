<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
            $response = $this->get('/reset-password/'.$notification->token);

            $response->assertStatus(200);

            return true;
        });
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $response = $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'Password!1',
                'password_confirmation' => 'Password!1',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'));

            return true;
        });
    }

    public function test_used_reset_password_link_is_rejected_on_screen_load(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use ($user) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'Password!1',
                'password_confirmation' => 'Password!1',
            ])->assertRedirect(route('login'));

            $response = $this->get('/reset-password/'.$notification->token.'?email='.urlencode($user->email));

            $response
                ->assertRedirect(route('password.request'))
                ->assertSessionHas('error');

            return true;
        });
    }

    public function test_logged_in_different_user_cannot_open_someone_elses_reset_link(): void
    {
        Notification::fake();

        $resetTarget = User::factory()->create();
        $differentLoggedInUser = User::factory()->create();

        $this->post('/forgot-password', ['email' => $resetTarget->email]);

        Notification::assertSentTo($resetTarget, ResetPassword::class, function ($notification) use ($resetTarget, $differentLoggedInUser) {
            $response = $this->actingAs($differentLoggedInUser)
                ->get('/reset-password/'.$notification->token.'?email='.urlencode($resetTarget->email));

            $response
                ->assertRedirect(route('password.request'))
                ->assertSessionHas('error');

            return true;
        });
    }
}
