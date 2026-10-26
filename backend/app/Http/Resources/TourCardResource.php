<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\FormatsMedia;
use App\Models\Tour;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/** @mixin Tour */
class TourCardResource extends JsonResource
{
    use FormatsMedia;

    public function toArray(Request $request): array
    {
        $locale = Locales::fromRequest($request);
        $t = $this->translate($locale);

        return [
            'id' => $this->id,
            'slug' => $t->slug,
            'path' => $this->category->path($locale).'/'.$t->slug,
            'title' => $t->title,
            'summary' => $t->summary ? Str::limit(trim(preg_replace('/\s+/', ' ', $t->summary)), 180) : null,
            'locale' => $t->locale,
            'category' => ['key' => $this->category->key, 'name' => $this->category->translate($locale)?->name],
            'duration_days' => $this->duration_days,
            'duration_nights' => $this->duration_nights,
            'difficulty' => $this->difficulty,
            'max_altitude_m' => $this->max_altitude_m,
            'price_mode' => $this->price_mode->value,
            'from_price' => $this->fromPrice(),
            'currency' => $this->currency,
            'price_basis' => $this->price_basis,
            'is_featured' => $this->is_featured,
            'hero' => $this->media($this->hero, $locale),
        ];
    }
}
