<?php

namespace App\Models;

use App\Enums\ReviewSource;
use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'source' => ReviewSource::class,
            'status' => ReviewStatus::class,
            'reviewed_at' => 'date',
            'is_featured' => 'boolean',
        ];
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', ReviewStatus::Published->value);
    }

    /** @return array{count:int, average:float|null} over published reviews (optionally for one tour). */
    public static function summary(?int $tourId = null): array
    {
        $query = static::published();
        if ($tourId !== null) {
            $query->where('tour_id', $tourId);
        }
        $count = (clone $query)->count();

        return ['count' => $count, 'average' => $count ? round((float) $query->avg('rating'), 1) : null];
    }
}
