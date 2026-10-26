<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = ['disk', 'path', 'legacy_wp_id', 'mime', 'size', 'width', 'height', 'alt', 'title'];

    protected function casts(): array
    {
        return ['alt' => 'array', 'title' => 'array'];
    }

    public function url(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }

    public function altFor(?string $locale = null): string
    {
        $locale ??= config('locales.default');

        return (string) ($this->alt[$locale] ?? $this->alt[config('locales.fallback')] ?? '');
    }
}
