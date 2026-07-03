<?php

namespace App\Enums;

use Illuminate\Support\Carbon;

enum SavingInterestPeriod: string
{
    case Daily = 'daily';
    case Monthly = 'monthly';
    case Yearly = 'yearly';

    public function label(): string
    {
        return match ($this) {
            self::Daily => 'Harian',
            self::Monthly => 'Bulanan',
            self::Yearly => 'Tahunan',
        };
    }

    public function periodsPerYear(): int
    {
        return match ($this) {
            self::Daily => 365,
            self::Monthly => 12,
            self::Yearly => 1,
        };
    }

    public function nextDate(Carbon $date): Carbon
    {
        return match ($this) {
            self::Daily => $date->copy()->addDay(),
            self::Monthly => $date->copy()->addMonthNoOverflow(),
            self::Yearly => $date->copy()->addYearNoOverflow(),
        };
    }
}
