<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** One site option. Known options and their defaults are listed in DEFAULTS; anything else is ignored. */
class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    protected function casts(): array
    {
        return ['value' => 'json'];
    }

    /** Public site options (sent to the website). */
    public const DEFAULTS = [
        // stop visitors from selecting, copying and right-clicking on the public site
        'copy_protection' => true,
    ];

    /** @return array<string, mixed> every known option, stored value or default */
    public static function current(): array
    {
        $stored = static::query()->whereIn('key', array_keys(self::DEFAULTS))->pluck('value', 'key')->all();

        return array_merge(self::DEFAULTS, array_intersect_key($stored, self::DEFAULTS));
    }

    public static function put(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }
}
