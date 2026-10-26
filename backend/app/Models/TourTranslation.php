<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourTranslation extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'highlights' => 'array',
            'facts' => 'array',
            'itinerary' => 'array',
            'included' => 'array',
            'excluded' => 'array',
            'packing' => 'array',
            'upgrades' => 'array',
            'extra' => 'array',
        ];
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
