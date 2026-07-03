<?php

namespace App\Models;

use App\Enums\SavingTransactionType;
use App\Support\Money;
use Database\Factories\SavingTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'saving_account_id',
    'type',
    'description',
    'amount',
    'occurred_at',
])]
class SavingTransaction extends Model
{
    /** @use HasFactory<SavingTransactionFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $appends = [
        'signed_amount',
        'type_label',
        'formatted_amount',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SavingTransactionType::class,
            'amount' => 'integer',
            'occurred_at' => 'date',
        ];
    }

    /**
     * @return BelongsTo<SavingAccount, $this>
     */
    public function savingAccount(): BelongsTo
    {
        return $this->belongsTo(SavingAccount::class);
    }

    public function getSignedAmountAttribute(): int
    {
        return $this->type->signedAmount($this->amount);
    }

    public function getTypeLabelAttribute(): string
    {
        return $this->type->label();
    }

    public function getFormattedAmountAttribute(): string
    {
        return Money::formatRupiahInput($this->amount);
    }
}
