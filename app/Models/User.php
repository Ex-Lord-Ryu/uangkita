<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordCodeNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'is_admin', 'is_super_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function isAdmin(): bool
    {
        return $this->is_admin === true || $this->is_super_admin === true;
    }

    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true;
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordCodeNotification($token));
    }

    /**
     * Scope to accounts that are managed as regular application users.
     *
     * @param  Builder<User>  $query
     * @return Builder<User>
     */
    public function scopeRegular(Builder $query): Builder
    {
        return $query
            ->where('is_admin', false)
            ->where('is_super_admin', false);
    }

    /**
     * @return HasMany<Feedback, $this>
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * @return HasMany<SavingAccount, $this>
     */
    public function savingAccounts(): HasMany
    {
        return $this->hasMany(SavingAccount::class);
    }

    /**
     * @return HasMany<Category, $this>
     */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_super_admin' => 'boolean',
        ];
    }
}
