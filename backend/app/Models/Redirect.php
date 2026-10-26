<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Redirect extends Model
{
    protected $fillable = ['from_path', 'to_path', 'status_code', 'is_active', 'hits', 'notes'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        static::saving(function (Redirect $redirect) {
            $redirect->from_path = static::normalize($redirect->from_path);
        });
    }

    /** Lower-case path with a leading and trailing slash and no query string or fragment. */
    public static function normalize(string $path): string
    {
        $path = parse_url($path, PHP_URL_PATH) ?: '/';
        $path = '/'.trim(mb_strtolower($path), '/');

        return $path === '/' ? '/' : $path.'/';
    }

    public static function findFor(string $path): ?self
    {
        return static::where('is_active', true)->where('from_path', static::normalize($path))->first();
    }
}
