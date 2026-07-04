<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\ResetPasswordCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $broker = Password::broker();
        $user = $broker->getUser($request->only('email'));

        if (is_null($user)) {
            throw ValidationException::withMessages([
                'email' => [trans(Password::INVALID_USER)],
            ]);
        }

        if ($broker->getRepository()->recentlyCreatedToken($user)) {
            throw ValidationException::withMessages([
                'email' => [trans(Password::RESET_THROTTLED)],
            ]);
        }

        $code = (string) random_int(100000, 999999);
        $email = $user->getEmailForPasswordReset();
        $brokerName = config('auth.defaults.passwords');
        $table = config("auth.passwords.{$brokerName}.table");

        DB::table($table)->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ],
        );

        $user->notify(new ResetPasswordCodeNotification($code));

        return redirect()
            ->route('password.reset', ['email' => $email])
            ->with('status', 'Kode reset password sudah dikirim ke email kamu.');
    }
}
