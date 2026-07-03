<?php

namespace Tests\Feature;

use App\Actions\SeedDefaultCategories;
use App\Enums\TransactionType;
use App\Models\User;
use App\Services\TextExpenseParser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TextExpenseParserTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        app(SeedDefaultCategories::class)->handle($this->user);
    }

    private function parse(string $input): array
    {
        return app(TextExpenseParser::class)->parse($input, $this->user);
    }

    public function test_it_parses_a_simple_expense(): void
    {
        $result = $this->parse('beli esteh 5000');

        $this->assertSame(TransactionType::Expense, $result['type']);
        $this->assertSame('esteh', $result['description']);
        $this->assertSame(5000, $result['amount']);
    }

    public function test_it_parses_thousand_separator(): void
    {
        $this->assertSame(5000, $this->parse('nasi goreng 5.000')['amount']);
        $this->assertSame(15000, $this->parse('makan 15,000')['amount']);
    }

    public function test_it_parses_shorthand_suffixes(): void
    {
        $this->assertSame(5000, $this->parse('teh 5rb')['amount']);
        $this->assertSame(5000, $this->parse('kopi 5k')['amount']);
        $this->assertSame(10_000_000, $this->parse('gaji 10jt')['amount']);
        $this->assertSame(1_500_000, $this->parse('bonus 1.5jt')['amount']);
    }

    public function test_it_detects_income(): void
    {
        $result = $this->parse('gaji 5jt');

        $this->assertSame(TransactionType::Income, $result['type']);
        $this->assertSame(5_000_000, $result['amount']);
    }

    public function test_it_assigns_a_category(): void
    {
        $result = $this->parse('beli esteh 5000');

        $this->assertNotNull($result['category_id']);
    }

    public function test_it_picks_the_largest_amount_when_quantity_present(): void
    {
        $result = $this->parse('beli 2 esteh 10000');

        $this->assertSame(10000, $result['amount']);
    }
}
