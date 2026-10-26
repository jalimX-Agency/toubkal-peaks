<?php

namespace App\Http\Resources;

use App\Models\Category;
use App\Models\Tour;
use App\Support\Locales;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Category */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $locale = Locales::fromRequest($request);
        $t = $this->translate($locale);
        $ids = $this->children->pluck('id')->push($this->id);

        return [
            'key' => $this->key,
            'slug' => $t?->slug,
            'path' => $this->path($locale),
            'name' => $t?->name,
            'intro' => $t?->intro,
            'seo' => ['title' => $t?->seo_title, 'description' => $t?->seo_description],
            'tours_count' => Tour::published()->whereIn('category_id', $ids)->count(),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
