<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasTranslations;

    protected $fillable = ['parent_id', 'key', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(CategoryTranslation::class);
    }

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class);
    }

    /** URL path of the category in a locale, e.g. "treks/toubkal" (parent slugs first). */
    public function path(?string $locale = null): string
    {
        $segments = [];
        for ($node = $this; $node; $node = $node->parent) {
            $node->loadMissing('translations');
            array_unshift($segments, $node->translate($locale)?->slug ?? $node->key);
        }

        return implode('/', $segments);
    }
}
