<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    /** Topics the website has labels for, in every language. */
    public const CATEGORIES = ['toubkal', 'atlas', 'desert', 'cities', 'practical'];

    public const AUTHOR = 'Toubkal Peaks Travel';

    protected $fillable = ['slug', 'title', 'excerpt', 'content', 'image_url', 'image_alt', 'category', 'author', 'is_featured', 'published_at'];

    protected $attributes = ['is_featured' => false];

    protected function casts(): array
    {
        return [
            'title' => 'array', 'excerpt' => 'array', 'content' => 'array', 'image_alt' => 'array',
            'is_featured' => 'boolean', 'published_at' => 'datetime',
        ];
    }

    /** Published, newest first; a publication date in the future waits for that day. */
    public function scopePublished(Builder $query): Builder
    {
        return $query->whereNotNull('published_at')->where('published_at', '<=', now())->orderByDesc('published_at')->orderByDesc('id');
    }

    /** A translated field in the visitor's language, falling back to English when it is not filled in. */
    public function localized(string $field, string $locale): mixed
    {
        $values = $this->{$field} ?? [];
        $value = $values[$locale] ?? null;

        return ($value === null || trim((string) $value) === '') ? ($values[config('locales.fallback')] ?? null) : $value;
    }

    /** The languages the article is written in (title and text filled in). @return list<string> */
    public function locales(): array
    {
        return array_values(array_filter(config('locales.supported'), fn (string $l) => trim((string) ($this->title[$l] ?? '')) !== '' && trim((string) ($this->content[$l] ?? '')) !== ''));
    }

    /** About 220 words a minute, never less than one. */
    public function readingMinutes(string $locale): int
    {
        $words = str_word_count(strip_tags((string) $this->localized('content', $locale)));

        return max(1, (int) round($words / 220));
    }

    public function toCardArray(string $locale): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'locale' => in_array($locale, $this->locales(), true) ? $locale : config('locales.fallback'),
            'title' => (string) $this->localized('title', $locale),
            'excerpt' => (string) ($this->localized('excerpt', $locale) ?? ''),
            'image' => $this->image_url ? ['url' => $this->image_url, 'alt' => (string) ($this->localized('image_alt', $locale) ?? '')] : null,
            'category' => $this->category,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toIso8601String(),
            'reading_minutes' => $this->readingMinutes($locale),
        ];
    }

    public function toPublicArray(string $locale): array
    {
        return $this->toCardArray($locale) + [
            'content' => (string) $this->localized('content', $locale),
            'author' => $this->author ?: self::AUTHOR,
            'updated_at' => $this->updated_at?->toIso8601String(),
            'locales' => $this->locales(),
        ];
    }
}
