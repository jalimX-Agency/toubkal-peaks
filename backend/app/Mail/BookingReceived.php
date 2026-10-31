<?php

namespace App\Mail;

use App\Mail\Concerns\DescribesBooking;
use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Sent to the customer right after the request, in the language they booked in. */
class BookingReceived extends Mailable
{
    use DescribesBooking;

    public function __construct(public Booking $booking)
    {
        $this->locale($booking->locale ?: 'en');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('emails.received.subject', ['reference' => $this->booking->reference]).' · Toubkal Peaks',
            replyTo: array_filter([config('mail.booking_reply_to')]),   // replies reach the reservations inbox
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking-received', with: [
            'rows' => $this->bookingRows(),
            'deposit' => $this->deposit(),
            'depositUrl' => $this->depositUrl(),
        ]);
    }
}
