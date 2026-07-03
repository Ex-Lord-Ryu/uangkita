<?php

namespace App\Support;

class Money
{
    public static function normalizeRupiahInput(mixed $value): mixed
    {
        if (! is_string($value) && ! is_int($value) && ! is_float($value)) {
            return $value;
        }

        $value = trim((string) $value);

        if ($value === '') {
            return $value;
        }

        $digits = preg_replace('/\D/', '', $value);

        return $digits === '' ? $value : $digits;
    }

    public static function formatRupiahInput(mixed $value): string
    {
        $normalized = self::normalizeRupiahInput($value);

        if (! is_numeric($normalized)) {
            return '';
        }

        return number_format((int) $normalized, 0, ',', '.');
    }
}
