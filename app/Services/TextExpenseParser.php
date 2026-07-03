<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\User;
use Illuminate\Support\Str;

class TextExpenseParser
{
    /**
     * Keywords that flag a line as income; anything else is treated as expense.
     *
     * @var array<int, string>
     */
    private array $incomeKeywords = [
        'gaji', 'gajian', 'payroll', 'upah', 'bonus', 'thr', 'insentif',
        'komisi', 'hadiah', 'terima', 'masuk', 'untung', 'pemasukan', 'dapat gaji',
    ];

    /**
     * Noise words stripped from the description (kept out of category guessing).
     *
     * @var array<int, string>
     */
    private array $noiseWords = ['beli', 'bayar', 'rp', 'seharga', 'harga', 'buat', 'untuk'];

    /**
     * Suffix multipliers for shorthand amounts (e.g. 5rb, 10jt).
     *
     * @var array<string, int>
     */
    private array $multipliers = [
        'juta' => 1_000_000,
        'jt' => 1_000_000,
        'ribu' => 1_000,
        'rb' => 1_000,
        'k' => 1_000,
    ];

    public function __construct(private CategoryGuesser $categoryGuesser) {}

    /**
     * Parse a free-text line into a draft transaction scoped to a user's categories.
     *
     * @return array{type: TransactionType, description: string, amount: int, category_id: int|null, raw_input: string}
     */
    public function parse(string $input, User $user): array
    {
        $input = trim($input);
        $type = $this->detectType($input);
        $amount = $this->extractAmount($input);
        $description = $this->extractDescription($input);
        $category = $this->categoryGuesser->guess($description, $type, $user);

        return [
            'type' => $type,
            'description' => $description,
            'amount' => $amount,
            'category_id' => $category?->id,
            'raw_input' => $input,
        ];
    }

    private function detectType(string $input): TransactionType
    {
        $haystack = Str::lower($input);

        foreach ($this->incomeKeywords as $keyword) {
            if (preg_match('/(?<![\p{L}\p{N}])'.preg_quote($keyword, '/').'(?![\p{L}\p{N}])/u', $haystack)) {
                return TransactionType::Income;
            }
        }

        return TransactionType::Expense;
    }

    /**
     * Extract the most likely amount; picks the largest detected value.
     */
    private function extractAmount(string $input): int
    {
        if (! preg_match_all($this->amountPattern(), $input, $matches, PREG_SET_ORDER)) {
            return 0;
        }

        $best = 0;

        foreach ($matches as $match) {
            $value = $this->valueOf($match[1], $match[2] ?? '');
            $best = max($best, $value);
        }

        return $best;
    }

    private function extractDescription(string $input): string
    {
        $text = Str::lower($input);

        // Remove amount tokens.
        $text = preg_replace($this->amountPattern(), ' ', $text) ?? $text;

        // Remove noise words.
        foreach ($this->noiseWords as $word) {
            $text = preg_replace('/(?<![\p{L}\p{N}])'.preg_quote($word, '/').'(?![\p{L}\p{N}])/u', ' ', $text) ?? $text;
        }

        $text = trim(preg_replace('/\s+/u', ' ', $text) ?? '');

        return $text !== '' ? $text : 'Transaksi';
    }

    /**
     * Compute the integer rupiah value of a number token and optional suffix.
     */
    private function valueOf(string $number, string $suffix): int
    {
        $suffix = Str::lower($suffix);

        if ($suffix !== '' && isset($this->multipliers[$suffix])) {
            $normalized = (float) str_replace(',', '.', $number);

            return (int) round($normalized * $this->multipliers[$suffix]);
        }

        // No suffix: dots/commas are thousand separators.
        return (int) str_replace(['.', ',', ' '], '', $number);
    }

    private function amountPattern(): string
    {
        return '/(\d+(?:[.,]\d+)*)\s*(juta|jt|ribu|rb|k)?(?![\p{L}\p{N}])/iu';
    }
}
