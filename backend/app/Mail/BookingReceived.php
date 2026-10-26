<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Confirmation sent to the customer right after the request (English for now; locale is stored on the booking). */
class BookingReceived extends Mailable
{
    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "We received your request {$this->booking->reference} - Toubkal Peaks",
            replyTo: array_filter([config('mail.booking_reply_to')]),   // replies reach the reservations inbox
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking-received');
    }
}
