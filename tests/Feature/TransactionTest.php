<?php

namespace Tests\Feature;

use App\Actions\SeedDefaultCategories;
use App\Models\AppSetting;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->user = User::factory()->create();
        app(SeedDefaultCategories::class)->handle($this->user);
    }

    public function test_guest_cannot_access_transactions(): void
    {
        $this->get(route('transactions.index'))->assertRedirect('/login');
    }

    public function test_index_shows_transactions_for_current_period(): void
    {
        $monthStart = today()->startOfMonth();
        Transaction::factory()
            ->count(3)
            ->sequence(
                ['amount' => 10000, 'occurred_at' => $monthStart->copy()->addDays(1)],
                ['amount' => 20000, 'occurred_at' => $monthStart->copy()->addDays(5)],
                ['amount' => 50000, 'occurred_at' => $monthStart->copy()->subMonth()],
            )
            ->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->component('Transactions/Index')
            ->has('transactions')
            ->has('summary')
            ->has('categories')
            ->has('period')
        );

        // Only first 2 transactions (this month) should appear.
        $response->assertInertia(fn ($page) => $page
            ->where('summary.total_expense', 30000)
        );
    }

    public function test_store_manual_transaction(): void
    {
        $this->actingAs($this->user)->post(route('transactions.store'), [
            'type' => 'expense',
            'description' => 'Beli nasi goreng',
            'amount' => 15000,
            'occurred_at' => today()->toDateString(),
        ])->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'description' => 'Beli nasi goreng',
            'amount' => 15000,
            'source' => 'manual',
        ]);
    }

    public function test_store_manual_transaction_accepts_formatted_rupiah_amount(): void
    {
        $this->actingAs($this->user)->post(route('transactions.store'), [
            'type' => 'expense',
            'description' => 'Bayar kontrakan',
            'amount' => '1.000.000',
            'occurred_at' => today()->toDateString(),
        ])->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'description' => 'Bayar kontrakan',
            'amount' => 1_000_000,
            'source' => 'manual',
        ]);
    }

    public function test_quick_store_from_text(): void
    {
        $this->actingAs($this->user)->post(route('transactions.quick'), [
            'raw_input' => 'beli esteh 5000',
        ])->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'type' => 'expense',
            'description' => 'esteh',
            'amount' => 5000,
            'source' => 'text',
        ]);
    }

    public function test_quick_store_detects_income(): void
    {
        $this->actingAs($this->user)->post(route('transactions.quick'), [
            'raw_input' => 'gaji 5jt',
        ])->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'user_id' => $this->user->id,
            'type' => 'income',
            'amount' => 5000000,
            'source' => 'text',
        ]);
    }

    public function test_ocr_scan_accepts_text_from_browser_tesseract_js(): void
    {
        $rawText = <<<'TEXT'
        TOKO MAJU
        Roti Tawar 12.000
        Susu UHT 2 8.500 17.000
        Total 29.000
        TEXT;

        $this->actingAs($this->user)->post(route('transactions.ocr-text'), [
            'raw_text' => $rawText,
        ])->assertRedirect(route('transactions.ocr-review'))
            ->assertSessionHas('ocr_draft', function (array $draft): bool {
                return $draft['raw_input'] === trim(<<<'TEXT'
                TOKO MAJU
                Roti Tawar 12.000
                Susu UHT 2 8.500 17.000
                Total 29.000
                TEXT)
                    && $draft['total'] === 29000
                    && $draft['items'][0]['description'] === 'Roti Tawar'
                    && $draft['items'][0]['amount'] === 12000
                    && $draft['items'][1]['description'] === 'Susu Uht'
                    && $draft['items'][1]['amount'] === 17000;
            });
    }

    public function test_ocr_scan_parses_double_line_receipt_format(): void
    {
        // Receipt format where item name is on one line and "qty×price total" on the next.
        // Also includes timestamp, URL, and payment footer lines that must be skipped.
        $rawText = <<<'TEXT'
        Berkaa Shop
        2022-04-14 Afi
        14:24:34 sheila
        No. 0-24
        Nasi Ayam Geprek
        1X 12.000 Rp 12.000
        Nasi Ayam Kremes
        1X 15.000 Rp 15.000
        Nasi Goreng Spesial
        1X 20.000 Rp 20.000
        Sub Total 47.000
        Total 47.000
        Bayar (Cash) 47.000
        Kembali 0
        olshopin.com/f/748488
        TEXT;

        $this->actingAs($this->user)->post(route('transactions.ocr-text'), [
            'raw_text' => $rawText,
        ])->assertRedirect(route('transactions.ocr-review'))
            ->assertSessionHas('ocr_draft', function (array $draft): bool {
                return $draft['total'] === 47000
                    && count($draft['items']) === 3
                    && $draft['items'][0]['description'] === 'Nasi Ayam Geprek'
                    && $draft['items'][0]['amount'] === 12000
                    && $draft['items'][1]['description'] === 'Nasi Ayam Kremes'
                    && $draft['items'][1]['amount'] === 15000
                    && $draft['items'][2]['description'] === 'Nasi Goreng Spesial'
                    && $draft['items'][2]['amount'] === 20000;
            });
    }

    public function test_ocr_scan_skips_npwp_tunai_and_kritikesaran_lines(): void
    {
        // Alfamart-style receipt: NPWP (and OCR misread "NPYP"), Tunai, KritikeSaran
        // (OCR merges words without space), and DD-MM-YYYY date — all must be skipped.
        $rawText = <<<'TEXT'
        ALFAMART STA. KARET
        NPWP : 01.336.238.9-054.000
        NPYP : 01.336.238.9-054.000
        Bon KC79-805-1905DM Kasir: mufti
        19-05-2017 06:51:42
        SARI ROTI SW CK 1 4,500 4,500
        Total Item 1 4,500
        Tunai 5,000
        Kembali 500
        KritikeSaran:1500959, SMS: 0817111234
        TEXT;

        $this->actingAs($this->user)->post(route('transactions.ocr-text'), [
            'raw_text' => $rawText,
        ])->assertRedirect(route('transactions.ocr-review'))
            ->assertSessionHas('ocr_draft', function (array $draft): bool {
                return $draft['total'] === 4500
                    && count($draft['items']) === 1
                    && $draft['items'][0]['description'] === 'Sari Roti Sw Ck'
                    && $draft['items'][0]['amount'] === 4500;
            });
    }

    public function test_ocr_scan_accepts_tsv_and_reconstructs_clean_lines(): void
    {
        // Minimal tesseract TSV: header + word-level rows (level=5).
        // Words are deliberately out-of-position order to prove sorting works.
        $tsv = implode("\n", [
            "level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext",
            // Line 1 — "TOKO MAJU" (words in correct left order)
            "5\t1\t1\t1\t1\t1\t10\t10\t60\t30\t95\tTOKO",
            "5\t1\t1\t1\t1\t2\t80\t10\t60\t30\t95\tMAJU",
            // Line 2 — "Roti Tawar 12.000"
            "5\t1\t1\t1\t2\t1\t10\t50\t40\t30\t92\tRoti",
            "5\t1\t1\t1\t2\t2\t60\t50\t50\t30\t92\tTawar",
            "5\t1\t1\t1\t2\t3\t200\t50\t70\t30\t91\t12.000",
            // Line 3 — "Susu UHT 2 8.500 17.000"
            "5\t1\t1\t1\t3\t1\t10\t90\t40\t30\t90\tSusu",
            "5\t1\t1\t1\t3\t2\t60\t90\t40\t30\t90\tUHT",
            "5\t1\t1\t1\t3\t3\t110\t90\t15\t30\t88\t2",
            "5\t1\t1\t1\t3\t4\t135\t90\t60\t30\t90\t8.500",
            "5\t1\t1\t1\t3\t5\t210\t90\t70\t30\t90\t17.000",
            // Line 4 — "Total 29.000"
            "5\t1\t1\t1\t4\t1\t10\t130\t50\t30\t95\tTotal",
            "5\t1\t1\t1\t4\t2\t70\t130\t70\t30\t95\t29.000",
        ]);

        $this->actingAs($this->user)->post(route('transactions.ocr-text'), [
            'raw_tsv' => $tsv,
        ])->assertRedirect(route('transactions.ocr-review'))
            ->assertSessionHas('ocr_draft', function (array $draft): bool {
                return $draft['raw_input'] === "TOKO MAJU\nRoti Tawar 12.000\nSusu UHT 2 8.500 17.000\nTotal 29.000"
                    && $draft['total'] === 29000
                    && $draft['items'][0]['description'] === 'Roti Tawar'
                    && $draft['items'][0]['amount'] === 12000
                    && $draft['items'][1]['description'] === 'Susu Uht'
                    && $draft['items'][1]['amount'] === 17000;
            });
    }

    public function test_ocr_scan_is_blocked_when_feature_is_disabled(): void
    {
        AppSetting::set('ocr_enabled', 'false');

        $this->actingAs($this->user)
            ->from(route('transactions.index'))
            ->post(route('transactions.ocr-text'), [
                'raw_text' => 'TOKO MAJU Total 29000',
            ])
            ->assertRedirect(route('transactions.index'))
            ->assertSessionHas('error', 'Fitur scan struk sedang dinonaktifkan.')
            ->assertSessionMissing('ocr_draft');
    }

    public function test_user_can_only_see_own_transactions(): void
    {
        $otherUser = User::factory()->create();

        Transaction::factory()->create([
            'user_id' => $this->user->id,
            'description' => 'My transaction',
            'amount' => 15000,
            'occurred_at' => today(),
        ]);
        Transaction::factory()->create([
            'user_id' => $otherUser->id,
            'description' => 'Their transaction',
            'amount' => 25000,
            'occurred_at' => today(),
        ]);

        $response = $this->actingAs($this->user)->get(route('transactions.index'));

        $response->assertInertia(fn ($page) => $page
            ->where('summary.total_expense', 15000)
        );
    }

    public function test_user_can_update_own_transaction(): void
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->user->id,
            'description' => 'Old description',
            'amount' => 5000,
        ]);

        $this->actingAs($this->user)->patch(route('transactions.update', $transaction), [
            'type' => 'expense',
            'description' => 'Updated description',
            'amount' => 10000,
            'occurred_at' => today()->toDateString(),
        ])->assertRedirect(route('transactions.index'));

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'description' => 'Updated description',
            'amount' => 10000,
        ]);
    }

    public function test_user_cannot_update_others_transaction(): void
    {
        $otherUser = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $this->actingAs($this->user)
            ->patch(route('transactions.update', $transaction), [
                'type' => 'expense',
                'description' => 'Hacked',
                'amount' => 1,
                'occurred_at' => today()->toDateString(),
            ])
            ->assertForbidden();
    }

    public function test_user_can_delete_own_transaction(): void
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->user->id,
        ]);

        $this->actingAs($this->user)
            ->delete(route('transactions.destroy', $transaction))
            ->assertRedirect(route('transactions.index'));

        $this->assertModelMissing($transaction);
    }

    public function test_user_cannot_delete_others_transaction(): void
    {
        $otherUser = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $this->actingAs($this->user)
            ->delete(route('transactions.destroy', $transaction))
            ->assertForbidden();
    }
}
