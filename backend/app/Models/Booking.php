<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class Booking extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
            'price_per_person' => 'decimal:2',
            'total_price' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'consent_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            $booking->reference ??= static::newReference();
            $booking->status ??= BookingStatus::Pending;
        });
        static::created(function (Booking $booking) {
            $booking->statusLogs()->create([
                'from_status' => null,
                'to_status' => $booking->status->value,
                'note' => 'Booking created',
            ]);
        });
    }

    /** e.g. TP-2026-K7M3QX (no look-alike characters, unique). */
    public static function newReference(): string
    {
        $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
            $reference = 'TP-'.now()->format('Y').'-'.$code;
        } while (static::withTrashed()->where('reference', $reference)->exists());

        return $reference;
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(BookingStatusLog::class)->orderBy('id');
    }

    public function guests(): int
    {
        return (int) $this->adults + (int) $this->children;
    }

    public function balanceDue(): ?float
    {
        return $this->total_price === null ? null : max(0.0, (float) $this->total_price - (float) $this->paid_amount);
    }

    /** Move to a new status, enforcing the allowed workflow and keeping an audit trail. */
    public function transitionTo(BookingStatus $to, ?int $userId = null, ?string $note = null): void
    {
        $from = $this->status;
        if (! $from->canTransitionTo($to)) {
            throw new InvalidArgumentException("Cannot move a booking from {$from->value} to {$to->value}.");
        }

        DB::transaction(function () use ($from, $to, $userId, $note) {
            $this->status = $to;
            match ($to) {
                BookingStatus::Confirmed => $this->confirmed_at = now(),
                BookingStatus::Completed => $this->completed_at = now(),
                BookingStatus::Cancelled => $this->cancelled_at = now(),
                default => null,
            };
            $this->save();
            $this->statusLogs()->create([
                'from_status' => $from->value,
                'to_status' => $to->value,
                'user_id' => $userId,
                'note' => $note,
            ]);
        });
    }
}
