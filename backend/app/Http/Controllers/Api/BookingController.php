<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Tour;
use App\Support\Locales;
use Illuminate\Support\Facades\Mail;
use Throwable;

class BookingController extends Controller
{
    /**
     * A visitor sends a reservation request. It is stored as "pending" and the team confirms it from the admin.
     * The price shown back is only an estimate based on the published per-person price for the party size.
     */
    public function store(StoreBookingRequest $request)
    {
        // Honeypot: pretend success without storing anything.
        if (filled($request->input('website'))) {
            return response()->json(['message' => 'Thank you.'], 202);
        }

        $data = $request->validated();
        $locale = Locales::resolve($data['locale'] ?? null);
        $adults = (int) $data['adults'];
        $children = (int) ($data['children'] ?? 0);

        $tour = isset($data['tour_id']) ? Tour::with(['translations', 'prices'])->find($data['tour_id']) : null;
        $perPerson = $tour?->priceFor($adults + $children);

        $booking = Booking::create([
            'tour_id' => $tour?->id,
            'tour_title' => $tour?->translate($locale)?->title,
            'locale' => $locale,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'adults' => $adults,
            'children' => $children,
            'price_per_person' => $perPerson,
            'total_price' => $perPerson === null ? null : round($perPerson * ($adults + $children), 2),
            'currency' => $tour?->currency ?? 'EUR',
            'special_requests' => $data['special_requests'] ?? null,
            'source' => 'website',
            'consent_at' => now(),
        ]);

        $this->notify($booking);

        return response()->json([
            'data' => [
                'reference' => $booking->reference,
                'status' => $booking->status->value,
                'estimated_total' => $booking->total_price === null ? null : (float) $booking->total_price,
                'currency' => $booking->currency,
            ],
            'message' => 'Your request has been received. We will reply within 24 hours.',
        ], 201);
    }

    /** A mail problem must never lose a booking: it is already saved, so only log the failure. */
    private function notify(Booking $booking): void
    {
        try {
            Mail::to($booking->email)->send(new BookingReceived($booking));
            Mail::to(config('mail.booking_notify') ?: config('mail.from.address'))->send(new NewBookingNotification($booking));
        } catch (Throwable $e) {
            report($e);
        }
    }
}
