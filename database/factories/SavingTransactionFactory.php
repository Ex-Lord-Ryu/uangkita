<?php

namespace Database\Factories;

use App\Enums\SavingTransactionType;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingTransaction>
 */
class SavingTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'saving_account_id' => SavingAccount::factory(),
            'type' => SavingTransactionType::Deposit,
            'description' => fake()->words(3, true),
            'amount' => fake()->numberBetween(50_000, 2_000_000),
            'occurred_at' => fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
        ];
    }

    public function withdrawal(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => SavingTransactionType::Withdrawal,
        ]);
    }
}
