<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureUserTransactionsViewEnabled as ViewTx;
use App\Models\AppSetting;
use App\Models\Category;
use App\Models\SavingAccount;
use App\Models\SavingTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function superAdmin(): User
    {
        return User::factory()->create([
            'is_admin' => true,
            'is_super_admin' => true,
        ]);
    }

    public function test_non_admin_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get(route('admin.dashboard'))->assertForbidden();
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $this->actingAs($this->admin())->get(route('admin.dashboard'))->assertOk();
    }

    public function test_admin_is_redirected_from_user_dashboard_to_admin_dashboard(): void
    {
        $this->actingAs($this->admin())
            ->get(route('dashboard'))
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_user_transactions_blocked_when_toggle_off(): void
    {
        // Toggle defaults to OFF — even an admin gets 403.
        $this->actingAs($this->admin())
            ->get(route('admin.user-transactions.index'))
            ->assertForbidden();
    }

    public function test_user_transactions_allowed_when_toggle_on(): void
    {
        $this->actingAs($this->admin())
            ->withSession([ViewTx::SESSION_KEY => true])
            ->get(route('admin.user-transactions.index'))
            ->assertOk();
    }

    public function test_user_transactions_page_includes_savings_and_saving_mutations(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create([
            'is_admin' => false,
            'is_super_admin' => false,
        ]);
        $category = Category::factory()->create(['user_id' => $user->id]);

        Transaction::factory()->income()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 1_000_000,
            'occurred_at' => '2026-07-01',
        ]);

        Transaction::factory()->create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'amount' => 250_000,
            'occurred_at' => '2026-07-02',
        ]);

        $savingAccount = SavingAccount::factory()->create([
            'user_id' => $user->id,
            'bank_name' => 'BCA',
            'name' => 'Dana Darurat',
            'principal_amount' => 500_000,
        ]);

        SavingTransaction::factory()->create([
            'saving_account_id' => $savingAccount->id,
            'type' => 'deposit',
            'description' => 'Setor tabungan',
            'amount' => 300_000,
            'occurred_at' => '2026-07-03',
        ]);

        SavingTransaction::factory()->withdrawal()->create([
            'saving_account_id' => $savingAccount->id,
            'description' => 'Tarik sebagian',
            'amount' => 100_000,
            'occurred_at' => '2026-07-04',
        ]);

        $this->actingAs($admin)
            ->withSession([ViewTx::SESSION_KEY => true])
            ->get(route('admin.user-transactions.index', ['user' => $user->id]))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/UserTransactions')
                ->where('summary.total_income', 1_000_000)
                ->where('summary.total_expense', 250_000)
                ->where('summary.balance', 750_000)
                ->where('summary.total_transactions', 2)
                ->where('summary.saving_balance', 700_000)
                ->where('summary.saving_accounts_count', 1)
                ->where('summary.saving_transactions_count', 2)
                ->has('savingAccounts', 1)
                ->where('savingAccounts.0.bank_name', 'BCA')
                ->where('savingAccounts.0.name', 'Dana Darurat')
                ->where('savingAccounts.0.stored_balance_amount', 700_000)
                ->has('savingAccounts.0.saving_transactions', 2)
                ->where('savingAccounts.0.saving_transactions.0.description', 'Tarik sebagian')
            );
    }

    public function test_admin_can_enable_then_disable_toggle(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put(route('admin.settings.view-user-tx'), ['enabled' => true]);
        $this->assertTrue(session(ViewTx::SESSION_KEY));

        $this->actingAs($admin)
            ->put(route('admin.settings.view-user-tx'), ['enabled' => false]);
        $this->assertFalse((bool) session(ViewTx::SESSION_KEY, false));
    }

    public function test_admin_can_update_browser_ocr_toggle(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put(route('admin.settings.ocr'), ['enabled' => false])
            ->assertRedirect();

        $this->assertFalse(AppSetting::bool('ocr_enabled', true));

        $this->actingAs($admin)
            ->put(route('admin.settings.ocr'), ['enabled' => true])
            ->assertRedirect();

        $this->assertTrue(AppSetting::bool('ocr_enabled', false));
    }

    public function test_toggle_is_cleared_on_logout(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->withSession([ViewTx::SESSION_KEY => true]);
        $this->actingAs($admin)->post(route('logout'));

        $this->assertFalse((bool) session(ViewTx::SESSION_KEY, false));
    }

    public function test_non_admin_cannot_manage_users(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get(route('admin.users.index'))->assertForbidden();
    }

    public function test_user_role_controls_are_only_available_to_super_admin(): void
    {
        $this->actingAs($this->admin())
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->where('canManageRoles', false)
            );

        $this->actingAs($this->superAdmin())
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Users/Index')
                ->where('canManageRoles', true)
            );
    }

    public function test_admin_cannot_create_another_admin(): void
    {
        $this->actingAs($this->admin())
            ->post(route('admin.users.store'), [
                'name' => 'Regular User',
                'email' => 'regular@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'is_admin' => true,
            ])
            ->assertRedirect();

        $created = User::where('email', 'regular@example.com')->firstOrFail();

        $this->assertFalse($created->is_admin);
        $this->assertFalse($created->is_super_admin);
    }

    public function test_super_admin_can_create_admin(): void
    {
        $this->actingAs($this->superAdmin())
            ->post(route('admin.users.store'), [
                'name' => 'New Admin',
                'email' => 'new-admin@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
                'is_admin' => true,
            ])
            ->assertRedirect();

        $created = User::where('email', 'new-admin@example.com')->firstOrFail();

        $this->assertTrue($created->is_admin);
        $this->assertFalse($created->is_super_admin);
    }

    public function test_admin_cannot_promote_existing_user(): void
    {
        $target = User::factory()->create([
            'name' => 'Regular User',
            'email' => 'target@example.com',
            'is_admin' => false,
        ]);

        $this->actingAs($this->admin())
            ->put(route('admin.users.update', $target), [
                'name' => 'Updated User',
                'email' => $target->email,
                'password' => '',
                'password_confirmation' => '',
                'is_admin' => true,
            ])
            ->assertRedirect();

        $target->refresh();

        $this->assertSame('Updated User', $target->name);
        $this->assertFalse($target->is_admin);
        $this->assertFalse($target->is_super_admin);
    }

    public function test_super_admin_can_promote_existing_user(): void
    {
        $target = User::factory()->create([
            'email' => 'promoted@example.com',
            'is_admin' => false,
        ]);

        $this->actingAs($this->superAdmin())
            ->put(route('admin.users.update', $target), [
                'name' => $target->name,
                'email' => $target->email,
                'password' => '',
                'password_confirmation' => '',
                'is_admin' => true,
            ])
            ->assertRedirect();

        $target->refresh();

        $this->assertTrue($target->is_admin);
        $this->assertFalse($target->is_super_admin);
    }

    public function test_admin_cannot_update_admin_account(): void
    {
        $target = $this->admin();

        $this->actingAs($this->admin())
            ->put(route('admin.users.update', $target), [
                'name' => 'Changed Admin',
                'email' => $target->email,
                'password' => '',
                'password_confirmation' => '',
                'is_admin' => false,
            ])
            ->assertForbidden();

        $this->assertSame($target->name, $target->fresh()->name);
        $this->assertTrue($target->fresh()->is_admin);
    }

    public function test_admin_cannot_delete_admin_account(): void
    {
        $target = $this->admin();

        $this->actingAs($this->admin())
            ->delete(route('admin.users.destroy', $target))
            ->assertForbidden();

        $this->assertNotNull($target->fresh());
    }
}
