<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordCodeNotification extends Notification
{
    use Queueable;

    public function __construct(public string $code) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode reset password UangKu')
            ->view([
                'html' => 'emails.auth.reset-password',
                'text' => 'emails.auth.reset-password-text',
            ], [
                'appName' => 'UangKu',
                'code' => $this->code,
                'expiresIn' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire'),
                'supportEmail' => config('mail.from.address'),
                'userName' => $notifiable->name,
            ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
