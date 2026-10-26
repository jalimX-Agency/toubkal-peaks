<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Internal alert for the team; replying goes straight to the customer. */
class NewBookingNotification extends Mailable
{
    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        $title = $this->booking->tour_title ?: 'Custom trip';

        return new Envelope(
            subject: "New booking request {$this->booking->reference}: {$title}",
            replyTo: [$this->booking->email],
        );
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking-notification');
    }
}
