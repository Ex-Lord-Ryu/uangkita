<?php

namespace Database\Factories;

use App\Models\SavingAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingAccount>
 */
class SavingAccountFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bank_name' => fake()->randomElement(['BCA', 'BRI', 'BNI', 'Mandiri']),
            'name' => fake()->words(2, true),
            'principal_amount' => fake()->numberBetween(100_000, 25_000_000),
            'has_interest' => false,
            'annual_interest_rate' => null,
            'interest_period' => 'monthly',
            'interest_started_at' => null,
        ];
    }

    public function withInterest(float $rate = 3.5, ?string $startedAt = null, string $period = 'monthly'): static
    {
        return $this->state(fn (array $attributes) => [
            'has_interest' => true,
            'annual_interest_rate' => $rate,
            'interest_period' => $period,
            'interest_started_at' => $startedAt ?? today()->subMonths(6)->toDateString(),
        ]);
    }
}
