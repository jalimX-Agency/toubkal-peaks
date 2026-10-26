<?php

namespace App\Http\Resources;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Review */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source->value,
            'author' => $this->author_name,
            'country' => $this->author_country,
            'rating' => $this->rating,
            'title' => $this->title,
            'body' => $this->body,
            'language' => $this->language,
            'date' => $this->reviewed_at?->toDateString(),
            'url' => $this->url,
            'tour_id' => $this->tour_id,
        ];
    }
}
