<?php

namespace App\Models;

use App\Enums\SavingInterestPeriod;
use App\Support\Money;
use Database\Factories\SavingAccountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

#[Fillable([
    'user_id',
    'bank_name',
    'name',
    'principal_amount',
    'has_interest',
    'annual_interest_rate',
    'interest_period',
    'interest_started_at',
])]
class SavingAccount extends Model
{
    /** @use HasFactory<SavingAccountFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $appends = [
        'stored_balance_amount',
        'estimated_interest_amount',
        'estimated_balance_amount',
        'formatted_principal_amount',
        'duration_days',
        'duration_months',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'principal_amount' => 'integer',
            'has_interest' => 'boolean',
            'annual_interest_rate' => 'float',
            'interest_period' => SavingInterestPeriod::class,
            'interest_started_at' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<SavingTransaction, $this>
     */
    public function savingTransactions(): HasMany
    {
        return $this->hasMany(SavingTransaction::class);
    }

    public function getStoredBalanceAmountAttribute(): int
    {
        return $this->storedBalanceAt();
    }

    public function getFormattedPrincipalAmountAttribute(): string
    {
        return Money::formatRupiahInput($this->principal_amount);
    }

    public function getEstimatedInterestAmountAttribute(): int
    {
        if (! $this->has_interest || ! $this->annual_interest_rate || ! $this->interest_started_at) {
            return 0;
        }

        $startedAt = $this->interest_started_at->copy()->startOfDay();
        $today = today()->startOfDay();

        if ($startedAt->greaterThanOrEqualTo($today)) {
            return 0;
        }

        $period = $this->interest_period ?? SavingInterestPeriod::Monthly;
        $ratePerDay = ($this->annual_interest_rate / 100) / 365;
        $transactions = $this->sortedSavingTransactions();
        $transactionsByDate = $transactions
            ->filter(fn (SavingTransaction $transaction): bool => $transaction->occurred_at->greaterThanOrEqualTo($startedAt))
            ->groupBy(fn (SavingTransaction $transaction): string => $transaction->occurred_at->toDateString());

        $balance = $this->storedBalanceAt($startedAt->copy()->subDay());
        $creditedInterest = 0.0;
        $pendingInterest = 0.0;
        $cursor = $startedAt->copy();
        $nextCreditDate = $period->nextDate($startedAt);

        while ($cursor->lessThan($today)) {
            foreach ($transactionsByDate->get($cursor->toDateString(), new Collection) as $transaction) {
                $balance += $transaction->signed_amount;
            }

            if ($balance > 0) {
                $pendingInterest += $balance * $ratePerDay;
            }

            $endOfDay = $cursor->copy()->addDay();

            while ($nextCreditDate->lessThanOrEqualTo($endOfDay)) {
                $roundedInterest = (int) round($pendingInterest);

                if ($roundedInterest > 0) {
                    $balance += $roundedInterest;
                    $creditedInterest += $roundedInterest;
                }

                $pendingInterest = 0.0;
                $nextCreditDate = $period->nextDate($nextCreditDate);
            }

            $cursor->addDay();
        }

        return (int) round($creditedInterest + $pendingInterest);
    }

    public function getEstimatedBalanceAmountAttribute(): int
    {
        return $this->getStoredBalanceAmountAttribute() + $this->getEstimatedInterestAmountAttribute();
    }

    public function getDurationDaysAttribute(): int
    {
        if (! $this->has_interest || ! $this->interest_started_at) {
            return 0;
        }

        $startedAt = $this->interest_started_at->copy()->startOfDay();
        $today = today()->startOfDay();

        if ($startedAt->greaterThan($today)) {
            return 0;
        }

        return (int) $startedAt->diffInDays($today);
    }

    public function getDurationMonthsAttribute(): int
    {
        if (! $this->has_interest || ! $this->interest_started_at) {
            return 0;
        }

        $startedAt = $this->interest_started_at->copy()->startOfDay();
        $today = today()->startOfDay();

        if ($startedAt->greaterThan($today)) {
            return 0;
        }

        return (int) $startedAt->diffInMonths($today);
    }

    private function storedBalanceAt(?Carbon $date = null): int
    {
        $balance = $this->principal_amount;

        foreach ($this->sortedSavingTransactions() as $transaction) {
            if ($date && $transaction->occurred_at->greaterThan($date)) {
                continue;
            }

            $balance += $transaction->signed_amount;
        }

        return $balance;
    }

    /**
     * @return Collection<int, SavingTransaction>
     */
    private function sortedSavingTransactions(): Collection
    {
        $transactions = $this->relationLoaded('savingTransactions')
            ? $this->savingTransactions
            : $this->savingTransactions()->get();

        return $transactions
            ->sortBy(fn (SavingTransaction $transaction): string => sprintf(
                '%s-%012d',
                $transaction->occurred_at->toDateString(),
                $transaction->id ?? 0,
            ))
            ->values();
    }
}
