<?php

namespace Tests\Feature;

use App\Actions\SeedDefaultCategories;
use App\Enums\TransactionType;
use App\Models\User;
use App\Services\CategoryGuesser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryGuesserTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        app(SeedDefaultCategories::class)->handle($this->user);
    }

    private function guess(string $text, TransactionType $type): ?string
    {
        return app(CategoryGuesser::class)->guess($text, $type, $this->user)?->name;
    }

    public function test_it_guesses_food_category(): void
    {
        $this->assertSame('Makanan & Minuman', $this->guess('esteh', TransactionType::Expense));
    }

    public function test_it_guesses_transport_category(): void
    {
        $this->assertSame('Transport', $this->guess('bensin motor', TransactionType::Expense));
    }

    public function test_it_falls_back_to_lainnya_when_unknown(): void
    {
        $this->assertSame('Lainnya', $this->guess('barang aneh xyz', TransactionType::Expense));
    }

    public function test_it_guesses_income_category(): void
    {
        $this->assertSame('Gaji', $this->guess('gaji', TransactionType::Income));
    }

    public function test_it_only_matches_categories_of_the_given_type(): void
    {
        $this->assertSame('Lainnya', $this->guess('gaji', TransactionType::Expense));
    }

    public function test_it_only_matches_the_users_own_categories(): void
    {
        $otherUser = User::factory()->create();
        app(SeedDefaultCategories::class)->handle($otherUser);

        $category = app(CategoryGuesser::class)->guess('esteh', TransactionType::Expense, $this->user);

        $this->assertSame($this->user->id, $category->user_id);
    }
}
