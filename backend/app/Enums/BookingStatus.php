<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Paid = 'paid';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /** @return list<self> */
    public function next(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Paid, self::Completed, self::Cancelled],
            self::Paid => [self::Completed, self::Cancelled],
            self::Completed, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $to): bool
    {
        return in_array($to, $this->next(), true);
    }
}
