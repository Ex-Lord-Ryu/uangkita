<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\SavingAccountSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_only_the_super_admin_account(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('app_settings', 0);
        $this->assertDatabaseCount('categories', 0);
        $this->assertDatabaseCount('transactions', 0);
        $this->assertDatabaseCount('saving_accounts', 0);

        $user = User::firstOrFail();

        $this->assertSame('Super Admin', $user->name);
        $this->assertSame('superadmin@gmail.com', $user->email);
        $this->assertTrue(Hash::check('admin123', $user->password));
        $this->assertTrue($user->is_admin);
        $this->assertTrue($user->is_super_admin);
    }

    public function test_saving_account_seeder_is_empty(): void
    {
        User::factory()->create();

        $this->seed(SavingAccountSeeder::class);

        $this->assertDatabaseCount('saving_accounts', 0);
    }
}
