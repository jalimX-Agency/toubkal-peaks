<?php

namespace App\Models;

use App\Enums\PriceMode;
use App\Enums\TourStatus;
use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tour extends Model
{
    use HasTranslations, SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => TourStatus::class,
            'price_mode' => PriceMode::class,
            'is_featured' => 'boolean',
            'price_reviewed_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function translations(): HasMany
    {
        return $this->hasMany(TourTranslation::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(TourPrice::class)->orderBy('min_pax');
    }

    public function hero(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'hero_media_id');
    }

    public function media(): BelongsToMany
    {
        return $this->belongsToMany(Media::class, 'tour_media')->withPivot(['role', 'sort_order'])->orderByPivot('sort_order');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', TourStatus::Published->value);
    }

    /** Lowest per-person price that is currently available, or null for "price on request". */
    public function fromPrice(): ?float
    {
        if ($this->price_mode !== PriceMode::Tiers) {
            return null;
        }
        $min = $this->prices->whereNull('valid_from')->pluck('price_per_person')->filter()->min();

        return $min === null ? null : (float) $min;
    }

    /** Per-person price for a party size (null = on request / not available for that size). */
    public function priceFor(int $pax): ?float
    {
        if ($this->price_mode !== PriceMode::Tiers) {
            return null;
        }
        $tier = $this->prices->whereNull('valid_from')->first(
            fn (TourPrice $p) => $pax >= $p->min_pax && ($p->max_pax === null || $pax <= $p->max_pax)
        );

        return $tier?->price_per_person === null ? null : (float) $tier->price_per_person;
    }
}
