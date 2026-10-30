<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\FormatsMedia;
use App\Models\Review;
use App\Models\Tour;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/** @mixin Tour */
class TourDetailResource extends JsonResource
{
    use FormatsMedia;

    public function toArray(Request $request): array
    {
        $locale = Locales::fromRequest($request);
        $t = $this->translate($locale);
        $categoryPath = $this->category->path($locale);

        $firstText = $t->summary ?: ($t->itinerary[0]['body'][0] ?? '');
        $description = $t->seo_description ?: Str::limit(trim(preg_replace('/\s+/', ' ', (string) $firstText)), 155);

        $related = Tour::published()
            ->where('category_id', $this->category_id)->where('id', '!=', $this->id)
            ->with(['translations', 'category.translations', 'category.parent.translations', 'hero', 'prices', 'media'])
            ->orderBy('sort_order')->orderBy('id')->limit(3)->get();

        return [
            'id' => $this->id,
            'slug' => $t->slug,
            'path' => $categoryPath.'/'.$t->slug,
            'title' => $t->title,
            'locale' => $t->locale,                                  // language of the content actually returned
            'requested_locale' => $locale,
            'category' => [
                'key' => $this->category->key,
                'name' => $this->category->translate($locale)?->name,
                'path' => $categoryPath,
            ],
            'duration_days' => $this->duration_days,
            'duration_nights' => $this->duration_nights,
            'difficulty' => $this->difficulty,
            'max_altitude_m' => $this->max_altitude_m,
            'summary' => $t->summary,
            'highlights' => $t->highlights ?? [],
            'facts' => $t->facts ?? [],
            'itinerary' => $t->itinerary ?? [],
            'included' => $t->included ?? [],
            'excluded' => $t->excluded ?? [],
            'packing' => $t->packing ?? [],
            'upgrades' => $t->upgrades ?? [],
            'pricing' => [
                'mode' => $this->price_mode->value,
                'currency' => $this->currency,
                'basis' => $this->price_basis,
                'from_price' => $this->fromPrice(),
                'tiers' => $this->prices->whereNull('valid_from')->map(fn ($p) => [
                    'min_pax' => $p->min_pax,
                    'max_pax' => $p->max_pax,
                    'price_per_person' => $p->price_per_person === null ? null : (float) $p->price_per_person,
                ])->values(),
            ],
            'images' => [
                'hero' => $this->media($this->hero, $locale),
                'gallery' => $this->media->where('id', '!=', $this->hero_media_id)->map(fn ($m) => $this->media($m, $locale))->values(),
            ],
            'reviews' => [
                'summary' => Review::summary($this->id),
                'latest' => ReviewResource::collection(
                    Review::published()->where('tour_id', $this->id)->latest('reviewed_at')->limit(5)->get()
                ),
            ],
            'related' => TourCardResource::collection($related),
            'seo' => [
                'title' => $t->seo_title ?: $t->title.' | Toubkal Peaks',
                'description' => $description,
            ],
            'alternates' => $this->translations->map(fn ($tr) => [
                'locale' => $tr->locale,
                'path' => $this->category->path($tr->locale).'/'.$tr->slug,
            ])->values(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
