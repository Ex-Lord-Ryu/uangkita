<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordCodeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_code_request_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_reset_password_code_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('password.reset', ['email' => $user->email]));

        Notification::assertSentTo($user, ResetPasswordCodeNotification::class, function ($notification) use ($user) {
            $message = $notification->toMail($user);
            $renderedMessage = (string) $message->render();
            $passwordReset = DB::table('password_reset_tokens')->where('email', $user->email)->first();

            $this->assertMatchesRegularExpression('/^\d{6}$/', $notification->code);
            $this->assertNotNull($passwordReset);
            $this->assertTrue(Hash::check($notification->code, $passwordReset->token));
            $this->assertSame('Kode reset password UangKu', $message->subject);
            $this->assertSame('emails.auth.reset-password', $message->view['html']);
            $this->assertStringContainsString('UangKu', $renderedMessage);
            $this->assertStringContainsString($notification->code, $renderedMessage);
            $this->assertStringNotContainsString('Logo Laravel', $renderedMessage);
            $this->assertStringNotContainsString('Atur Ulang Password', $renderedMessage);

            return true;
        });
    }

    public function test_reset_password_code_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->get(route('password.reset', ['email' => $user->email]));

        $response->assertStatus(200);
    }

    public function test_password_can_be_reset_with_valid_code(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPasswordCodeNotification::class, function ($notification) use ($user) {
            $response = $this->post('/reset-password', [
                'email' => $user->email,
                'code' => $notification->code,
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'));

            return true;
        });
    }

    public function test_password_cannot_be_reset_with_invalid_code(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $response = $this->post('/reset-password', [
            'email' => $user->email,
            'code' => '000000',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasErrors('code');
    }
}
