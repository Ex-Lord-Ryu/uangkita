<?php

namespace App\Enums;

enum FeedbackStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Terbuka',
            self::InProgress => 'Diproses',
            self::Resolved => 'Selesai',
            self::Closed => 'Ditutup',
        };
    }

    public function badgeTone(): string
    {
        return match ($this) {
            self::Open => 'amber',
            self::InProgress => 'brand',
            self::Resolved => 'green',
            self::Closed => 'gray',
        };
    }
}
