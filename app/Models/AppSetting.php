<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key, with an optional default.
     * Returns the default gracefully when the table does not exist yet (e.g. during tests before migration).
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("setting:{$key}", function () use ($key, $default) {
            try {
                return static::where('key', $key)->value('value') ?? $default;
            } catch (\Throwable) {
                return $default;
            }
        });
    }

    /**
     * Get a setting as boolean.
     */
    public static function bool(string $key, bool $default = false): bool
    {
        $val = static::get($key);

        return $val === null ? $default : filter_var($val, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Set a setting value and clear its cache.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting:{$key}");
    }
}
