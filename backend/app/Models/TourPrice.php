<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourPrice extends Model
{
    protected $fillable = ['tour_id', 'min_pax', 'max_pax', 'price_per_person', 'valid_from', 'valid_to'];

    protected function casts(): array
    {
        return [
            'price_per_person' => 'decimal:2',
            'valid_from' => 'date',
            'valid_to' => 'date',
        ];
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
