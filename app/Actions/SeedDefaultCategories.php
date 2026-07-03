<?php

namespace App\Actions;

use App\Enums\TransactionType;
use App\Models\User;

class SeedDefaultCategories
{
    /**
     * Default Indonesian categories with keyword matchers.
     *
     * @var array<int, array{name: string, type: TransactionType, icon: string, color: string, keywords: array<int, string>}>
     */
    public const DEFAULTS = [
        // Expense
        ['name' => 'Makanan & Minuman', 'type' => TransactionType::Expense, 'icon' => '🍜', 'color' => '#f97316', 'keywords' => ['makan', 'makanan', 'minum', 'nasi', 'esteh', 'es teh', 'teh', 'kopi', 'ayam', 'bakso', 'mie', 'mi', 'jajan', 'gorengan', 'snack', 'cemilan', 'sarapan', 'warteg', 'martabak', 'roti', 'soto', 'sate', 'gado', 'kfc', 'mcd', 'burger', 'pizza', 'es', 'jus']],
        ['name' => 'Transport', 'type' => TransactionType::Expense, 'icon' => '🚗', 'color' => '#3b82f6', 'keywords' => ['bensin', 'pertalite', 'pertamax', 'solar', 'ojek', 'ojol', 'grab', 'gojek', 'gocar', 'parkir', 'tol', 'angkot', 'bus', 'kereta', 'krl', 'mrt', 'taksi', 'taxi', 'travel', 'tiket', 'transport', 'ban']],
        ['name' => 'Belanja', 'type' => TransactionType::Expense, 'icon' => '🛍️', 'color' => '#ec4899', 'keywords' => ['belanja', 'baju', 'celana', 'sepatu', 'sabun', 'sampo', 'shampoo', 'odol', 'deterjen', 'tisu', 'kosmetik', 'skincare', 'alfamart', 'indomaret', 'supermarket', 'mall']],
        ['name' => 'Tagihan', 'type' => TransactionType::Expense, 'icon' => '🧾', 'color' => '#ef4444', 'keywords' => ['listrik', 'pulsa', 'wifi', 'internet', 'indihome', 'pdam', 'air', 'token', 'tagihan', 'cicilan', 'kontrakan', 'kos', 'sewa', 'bpjs', 'asuransi', 'kuota']],
        ['name' => 'Kesehatan', 'type' => TransactionType::Expense, 'icon' => '💊', 'color' => '#14b8a6', 'keywords' => ['obat', 'dokter', 'vitamin', 'apotek', 'rumah sakit', 'klinik', 'periksa', 'masker', 'suplemen']],
        ['name' => 'Hiburan', 'type' => TransactionType::Expense, 'icon' => '🎮', 'color' => '#8b5cf6', 'keywords' => ['nonton', 'bioskop', 'game', 'top up', 'netflix', 'spotify', 'youtube', 'langganan', 'liburan', 'wisata', 'main']],
        ['name' => 'Lainnya', 'type' => TransactionType::Expense, 'icon' => '📦', 'color' => '#6b7280', 'keywords' => []],

        // Income
        ['name' => 'Gaji', 'type' => TransactionType::Income, 'icon' => '💰', 'color' => '#22c55e', 'keywords' => ['gaji', 'gajian', 'payroll', 'upah']],
        ['name' => 'Bonus', 'type' => TransactionType::Income, 'icon' => '🎁', 'color' => '#84cc16', 'keywords' => ['bonus', 'thr', 'insentif', 'komisi', 'hadiah']],
        ['name' => 'Pemasukan Lain', 'type' => TransactionType::Income, 'icon' => '➕', 'color' => '#10b981', 'keywords' => []],
    ];

    /**
     * Create the default set of categories for a newly registered user.
     */
    public function handle(User $user): void
    {
        foreach (self::DEFAULTS as $category) {
            $user->categories()->create([
                'name' => $category['name'],
                'type' => $category['type'],
                'icon' => $category['icon'],
                'color' => $category['color'],
                'keywords' => $category['keywords'],
                'is_default' => true,
            ]);
        }
    }
}
