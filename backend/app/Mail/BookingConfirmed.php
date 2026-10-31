<?php

namespace App\Mail;

use App\Mail\Concerns\DescribesBooking;
use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Sent to the customer when the team marks the request "confirmed" (the trip is available): the moment
 * to pay the deposit, so the PayPal button is the main action.
 */
class BookingConfirmed extends Mailable
{
    use DescribesBooking;

    public function __construct(public Booking $booking)
    {
        $this->locale($booking->locale ?: 'en');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.confirmed.subject', ['reference' => $this->booking->reference]).' · Toubkal Peaks',
            replyTo: array_filter([config('mail.booking_reply_to')]),
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking-confirmed', with: [
            'rows' => $this->bookingRows(),
            'deposit' => $this->deposit(),
            'depositUrl' => $this->depositUrl(),
        ]);
    }
}
