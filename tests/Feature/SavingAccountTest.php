<?php

namespace Tests\Feature;

use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class SavingAccountTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Carbon::setTestNow('2026-07-03 00:00:00');

        $this->user = User::factory()->create();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_guest_cannot_access_savings(): void
    {
        $this->get(route('savings.index'))->assertRedirect('/login');
    }

    public function test_index_shows_saving_accounts_and_summary(): void
    {
        SavingAccount::factory()->create([
            'user_id' => $this->user->id,
            'bank_name' => 'BCA',
            'name' => 'Dana Darurat',
            'principal_amount' => 1_000_000,
        ]);

        $interestAccount = SavingAccount::factory()
            ->withInterest(3.65, '2025-07-03')
            ->create([
                'user_id' => $this->user->id,
                'bank_name' => 'Mandiri',
                'name' => 'Deposito',
                'principal_amount' => 1_000_000,
            ]);
        $expectedInterest = $interestAccount->estimated_interest_amount;

        $response = $this->actingAs($this->user)->get(route('savings.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Savings/Index')
            ->has('saving_accounts', 2)
            ->where('summary.principal', 2_000_000)
            ->where('summary.interest', $expectedInterest)
            ->where('summary.total', 2_000_000 + $expectedInterest)
            ->where('summary.account_count', 2)
        );
    }

    public function test_store_saving_account_without_interest(): void
    {
        $this->actingAs($this->user)->post(route('savings.store'), [
            'bank_name' => 'BCA',
            'principal_amount' => '5.000.000',
            'has_interest' => false,
            'annual_interest_rate' => 4.5,
            'interest_period' => 'daily',
            'interest_started_at' => '2026-01-01',
        ])->assertRedirect(route('savings.index'));

        $this->assertDatabaseHas('saving_accounts', [
            'user_id' => $this->user->id,
            'bank_name' => 'BCA',
            'name' => 'Tabungan BCA',
            'principal_amount' => 5_000_000,
            'has_interest' => false,
            'annual_interest_rate' => null,
            'interest_period' => 'monthly',
            'interest_started_at' => null,
        ]);
    }

    public function test_store_saving_account_with_interest(): void
    {
        $this->actingAs($this->user)->post(route('savings.store'), [
            'bank_name' => 'BRI',
            'name' => 'Tabungan bunga',
            'principal_amount' => 2_000_000,
            'has_interest' => true,
            'annual_interest_rate' => 4.25,
            'interest_period' => 'monthly',
            'interest_started_at' => '2026-01-03',
        ])->assertRedirect(route('savings.index'));

        $this->assertDatabaseHas('saving_accounts', [
            'user_id' => $this->user->id,
            'bank_name' => 'BRI',
            'name' => 'Tabungan bunga',
            'principal_amount' => 2_000_000,
            'has_interest' => true,
            'annual_interest_rate' => 4.25,
            'interest_period' => 'monthly',
        ]);

        $savingAccount = SavingAccount::where('user_id', $this->user->id)
            ->where('bank_name', 'BRI')
            ->firstOrFail();

        $this->assertSame('2026-01-03', $savingAccount->interest_started_at->toDateString());
    }

    public function test_interest_fields_are_required_when_interest_is_enabled(): void
    {
        $this->actingAs($this->user)
            ->from(route('savings.index'))
            ->post(route('savings.store'), [
                'bank_name' => 'BNI',
                'name' => 'Tabungan bunga',
                'principal_amount' => 1_000_000,
                'has_interest' => true,
            ])
            ->assertRedirect(route('savings.index'))
            ->assertSessionHasErrors(['annual_interest_rate', 'interest_period', 'interest_started_at']);
    }

    public function test_user_can_only_see_own_saving_accounts(): void
    {
        $otherUser = User::factory()->create();

        SavingAccount::factory()->create([
            'user_id' => $this->user->id,
            'principal_amount' => 100_000,
        ]);

        SavingAccount::factory()->create([
            'user_id' => $otherUser->id,
            'principal_amount' => 900_000,
        ]);

        $this->actingAs($this->user)
            ->get(route('savings.index'))
            ->assertInertia(fn ($page) => $page
                ->has('saving_accounts', 1)
                ->where('summary.total', 100_000)
            );
    }

    public function test_user_can_update_own_saving_account(): void
    {
        $savingAccount = SavingAccount::factory()
            ->withInterest(3.5, '2026-01-01')
            ->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)->patch(route('savings.update', $savingAccount), [
            'bank_name' => 'Mandiri',
            'name' => 'Tabungan utama',
            'principal_amount' => 7_500_000,
            'has_interest' => false,
            'interest_period' => 'monthly',
        ])->assertRedirect(route('savings.index'));

        $this->assertDatabaseHas('saving_accounts', [
            'id' => $savingAccount->id,
            'bank_name' => 'Mandiri',
            'name' => 'Tabungan utama',
            'principal_amount' => 7_500_000,
            'has_interest' => false,
            'annual_interest_rate' => null,
            'interest_period' => 'monthly',
            'interest_started_at' => null,
        ]);
    }

    public function test_user_cannot_update_others_saving_account(): void
    {
        $otherUser = User::factory()->create();
        $savingAccount = SavingAccount::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->patch(route('savings.update', $savingAccount), [
                'bank_name' => 'BCA',
                'name' => 'Hacked',
                'principal_amount' => 1,
                'has_interest' => false,
                'interest_period' => 'monthly',
            ])
            ->assertForbidden();
    }

    public function test_user_can_deposit_and_withdraw_from_saving_account_multiple_times(): void
    {
        $savingAccount = SavingAccount::factory()->create([
            'user_id' => $this->user->id,
            'principal_amount' => 1_000_000,
        ]);

        $this->actingAs($this->user)->post(route('savings.transactions.store', $savingAccount), [
            'type' => 'deposit',
            'description' => 'Nabung gajian',
            'amount' => '500.000',
            'occurred_at' => '2026-07-01',
        ])->assertRedirect(route('savings.index'));

        $this->actingAs($this->user)->post(route('savings.transactions.store', $savingAccount), [
            'type' => 'withdrawal',
            'description' => 'Ambil dana',
            'amount' => '200.000',
            'occurred_at' => '2026-07-02',
        ])->assertRedirect(route('savings.index'));

        $this->assertDatabaseHas('saving_transactions', [
            'saving_account_id' => $savingAccount->id,
            'type' => 'deposit',
            'amount' => 500_000,
        ]);

        $this->assertDatabaseHas('saving_transactions', [
            'saving_account_id' => $savingAccount->id,
            'type' => 'withdrawal',
            'amount' => 200_000,
        ]);

        $this->assertSame(1_300_000, $savingAccount->fresh()->stored_balance_amount);
    }

    public function test_user_cannot_withdraw_more_than_current_saving_balance(): void
    {
        $savingAccount = SavingAccount::factory()->create([
            'user_id' => $this->user->id,
            'principal_amount' => 100_000,
        ]);

        $this->actingAs($this->user)
            ->from(route('savings.index'))
            ->post(route('savings.transactions.store', $savingAccount), [
                'type' => 'withdrawal',
                'description' => 'Terlalu besar',
                'amount' => 150_000,
                'occurred_at' => '2026-07-02',
            ])
            ->assertRedirect(route('savings.index'))
            ->assertSessionHasErrors(['amount']);

        $this->assertDatabaseCount('saving_transactions', 0);
    }

    public function test_user_cannot_create_mutation_for_others_saving_account(): void
    {
        $otherUser = User::factory()->create();
        $savingAccount = SavingAccount::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->post(route('savings.transactions.store', $savingAccount), [
                'type' => 'deposit',
                'description' => 'Hacked',
                'amount' => 100_000,
                'occurred_at' => '2026-07-02',
            ])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_saving_mutation(): void
    {
        $savingAccount = SavingAccount::factory()->create(['user_id' => $this->user->id]);
        $savingTransaction = SavingTransaction::factory()->create([
            'saving_account_id' => $savingAccount->id,
        ]);

        $this->actingAs($this->user)
            ->delete(route('savings.transactions.destroy', [$savingAccount, $savingTransaction]))
            ->assertRedirect(route('savings.index'));

        $this->assertModelMissing($savingTransaction);
    }

    public function test_interest_estimate_uses_running_balance_after_deposits(): void
    {
        $savingAccount = SavingAccount::factory()
            ->withInterest(12, '2026-07-01', 'daily')
            ->create([
                'user_id' => $this->user->id,
                'principal_amount' => 1_000_000,
            ]);

        SavingTransaction::factory()->create([
            'saving_account_id' => $savingAccount->id,
            'type' => 'deposit',
            'amount' => 1_000_000,
            'occurred_at' => '2026-07-02',
        ]);

        $savingAccount = $savingAccount->fresh('savingTransactions');
        $baselineInterest = (int) round(1_000_000 * (12 / 100) * (2 / 365));

        $this->assertSame(2_000_000, $savingAccount->stored_balance_amount);
        $this->assertGreaterThan($baselineInterest, $savingAccount->estimated_interest_amount);
    }

    public function test_user_can_delete_own_saving_account(): void
    {
        $savingAccount = SavingAccount::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->delete(route('savings.destroy', $savingAccount))
            ->assertRedirect(route('savings.index'));

        $this->assertModelMissing($savingAccount);
    }

    public function test_user_cannot_delete_others_saving_account(): void
    {
        $otherUser = User::factory()->create();
        $savingAccount = SavingAccount::factory()->create(['user_id' => $otherUser->id]);

        $this->actingAs($this->user)
            ->delete(route('savings.destroy', $savingAccount))
            ->assertForbidden();
    }

    public function test_dashboard_keeps_savings_separate_from_cashflow_balance(): void
    {
        Transaction::factory()->income()->create([
            'user_id' => $this->user->id,
            'amount' => 100_000,
            'occurred_at' => '2026-07-01',
        ]);

        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'amount' => 30_000,
            'occurred_at' => '2026-07-02',
        ]);

        SavingAccount::factory()->create([
            'user_id' => $this->user->id,
            'principal_amount' => 500_000,
        ])->savingTransactions()->create([
            'type' => 'deposit',
            'description' => 'Setor tambahan',
            'amount' => 200_000,
            'occurred_at' => '2026-07-02',
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->where('summary.balance', 70_000)
                ->where('summary.savings', 700_000)
            );
    }
}
