<?php

namespace App\Enums;

enum SavingTransactionType: string
{
    case Deposit = 'deposit';
    case Withdrawal = 'withdrawal';

    public function label(): string
    {
        return match ($this) {
            self::Deposit => 'Setor',
            self::Withdrawal => 'Tarik',
        };
    }

    public function signedAmount(int $amount): int
    {
        return match ($this) {
            self::Deposit => $amount,
            self::Withdrawal => -$amount,
        };
    }
}
