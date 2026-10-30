<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Model
{
    protected $fillable = ['name', 'role', 'bio', 'photo_alt', 'photo_media_id', 'sort_order', 'is_active'];

    protected $attributes = ['is_active' => true, 'sort_order' => 0];

    protected function casts(): array
    {
        return ['role' => 'array', 'bio' => 'array', 'photo_alt' => 'array', 'is_active' => 'boolean'];
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'photo_media_id');
    }

    public function scopeShown(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('id');
    }

    /** A translated field in the visitor's language, falling back to English when it is not filled in. */
    public function localized(string $field, string $locale): mixed
    {
        $values = $this->{$field} ?? [];
        $value = $values[$locale] ?? null;

        return ($value === null || $value === '' || $value === []) ? ($values[config('locales.fallback')] ?? null) : $value;
    }

    /** @return array{id:int, name:string, role:string, bio:list<string>, photo:?array} */
    public function toPublicArray(string $locale): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => (string) $this->localized('role', $locale),
            'bio' => array_values(array_filter((array) $this->localized('bio', $locale), fn ($p) => trim((string) $p) !== '')),
            'photo' => $this->photo ? [
                'url' => $this->photo->url(),
                'alt' => (string) ($this->localized('photo_alt', $locale) ?? $this->name),
                'width' => $this->photo->width,
                'height' => $this->photo->height,
            ] : null,
        ];
    }
}
