<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;

/**
 * Shared lookup for models that keep their text in a "<model>_translations" table.
 * Falls back to the source locale when a translation is missing.
 */
trait HasTranslations
{
    public function translate(?string $locale = null): ?Model
    {
        $locale ??= config('locales.default');

        return $this->translations->firstWhere('locale', $locale)
            ?? $this->translations->firstWhere('locale', config('locales.fallback'));
    }

    public function hasTranslation(string $locale): bool
    {
        return $this->translations->contains('locale', $locale);
    }
}
