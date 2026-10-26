<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    private function booking(array $attrs = []): Booking
    {
        return Booking::create(array_merge([
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
            'email' => 'ana@example.com',
            'adults' => 2,
            'children' => 1,
            'tour_title' => '3 Days Mount Toubkal Trek',
            'total_price' => 558,
            'paid_amount' => 100,
        ], $attrs));
    }

    public function test_a_new_booking_gets_a_unique_reference_status_and_first_log(): void
    {
        $a = $this->booking();
        $b = $this->booking();

        $this->assertMatchesRegularExpression('/^TP-\d{4}-[A-Z2-9]{6}$/', $a->reference);
        $this->assertNotSame($a->reference, $b->reference);
        $this->assertSame(BookingStatus::Pending, $a->fresh()->status);
        $this->assertSame(['pending'], $a->statusLogs->pluck('to_status')->all());
        $this->assertSame(3, $a->guests());
        $this->assertSame(458.0, $a->balanceDue());
    }

    public function test_valid_transitions_are_logged_with_timestamps_and_user(): void
    {
        $user = User::factory()->create();
        $booking = $this->booking();

        $booking->transitionTo(BookingStatus::Confirmed, $user->id, 'Called the customer');
        $booking->transitionTo(BookingStatus::Paid);
        $booking->transitionTo(BookingStatus::Completed);

        $booking->refresh();
        $this->assertSame(BookingStatus::Completed, $booking->status);
        $this->assertNotNull($booking->confirmed_at);
        $this->assertNotNull($booking->completed_at);
        $this->assertSame(['pending', 'confirmed', 'paid', 'completed'], $booking->statusLogs->pluck('to_status')->all());
        $this->assertSame($user->id, $booking->statusLogs[1]->user_id);
        $this->assertSame('Called the customer', $booking->statusLogs[1]->note);
    }

    public function test_invalid_transitions_are_rejected(): void
    {
        $booking = $this->booking();

        $this->expectException(InvalidArgumentException::class);
        $booking->transitionTo(BookingStatus::Completed);   // pending cannot jump to completed
    }

    public function test_cancelled_bookings_are_final(): void
    {
        $booking = $this->booking();
        $booking->transitionTo(BookingStatus::Cancelled);

        $this->assertNotNull($booking->fresh()->cancelled_at);
        $this->assertSame([], $booking->status->next());
        $this->expectException(InvalidArgumentException::class);
        $booking->transitionTo(BookingStatus::Confirmed);
    }
}
