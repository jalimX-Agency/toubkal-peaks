<?php

namespace Tests\Feature;

use App\Mail\BookingConfirmed;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

/** The mail tests elsewhere fake the mailer, which never builds the message: these build every message for real. */
class BookingEmailsRenderTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_every_email_can_be_built_for_every_trip_and_language(): void
    {
        $this->importRealTours();
        $this->artisan('toubkal:import-new-trips')->assertSuccessful();

        $built = 0;
        foreach (Tour::with(['translations', 'category'])->get() as $tour) {
            foreach (config('locales.supported') as $locale) {
                $booking = Booking::create([
                    'tour_id' => $tour->id, 'tour_title' => $tour->translate($locale)?->title, 'locale' => $locale,
                    'first_name' => 'Danielle', 'last_name' => 'Kurtin', 'email' => 'danielle@example.com', 'phone' => '+447549164515', 'country' => 'United Kingdom',
                    'start_date' => '2026-11-28', 'adults' => 2, 'children' => 0, 'price_per_person' => $tour->fromPrice(),
                    'total_price' => $tour->fromPrice() === null ? null : $tour->fromPrice() * 2, 'currency' => $tour->currency ?? 'EUR',
                    'conditions_accepted_at' => now(), 'conditions_version' => Tour::CONDITIONS_VERSION, 'deposit_amount' => 120,
                ]);

                foreach ([new BookingReceived($booking), new NewBookingNotification($booking), new BookingConfirmed($booking)] as $mail) {
                    $html = $mail->render();
                    $this->assertNotSame('', trim($html), get_class($mail)." for tour {$tour->id} in {$locale}");
                    $built++;
                }
            }
        }
        $this->assertGreaterThan(100, $built);
    }
}
