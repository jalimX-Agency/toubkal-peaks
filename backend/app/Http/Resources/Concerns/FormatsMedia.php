<?php

namespace App\Http\Resources\Concerns;

use App\Models\Media;

trait FormatsMedia
{
    /** @return array{url:string, alt:string, width:?int, height:?int}|null */
    protected function media(?Media $media, string $locale): ?array
    {
        if (! $media) {
            return null;
        }

        return ['url' => $media->url(), 'alt' => $media->altFor($locale), 'width' => $media->width, 'height' => $media->height];
    }
}
