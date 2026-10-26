<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Mail\BookingReceived;
use App\Mail\NewBookingNotification;
use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    /** @return array<string,mixed> */
    private function payload(array $override = []): array
    {
        return array_replace([
            'tour_id' => Tour::where('legacy_wp_id', 1001)->value('id'),
            'first_name' => 'Ana',
            'last_name' => 'Lopez',
            'email' => 'ana@example.com',
            'country' => 'Spain',
            'start_date' => now()->addMonth()->toDateString(),
            'adults' => 2,
            'children' => 1,
            'special_requests' => 'Vegetarian meals',
            'consent' => true,
            'locale' => 'es',
        ], $override);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->importRealTours();
    }

    public function test_a_request_is_stored_priced_and_both_emails_are_sent(): void
    {
        Mail::fake();
        config(['mail.booking_notify' => 'team@toubkal-peaks.com']);

        $response = $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();

        // 3 travellers -> the "2-3 people" tier of 279 EUR each
        $response->assertJsonPath('data.status', 'pending')->assertJsonPath('data.estimated_total', 837)->assertJsonPath('data.currency', 'EUR');
        $this->assertMatchesRegularExpression('/^TP-\d{4}-[A-Z2-9]{6}$/', $response->json('data.reference'));

        $booking = Booking::firstOrFail();
        $this->assertSame(BookingStatus::Pending, $booking->status);
        $this->assertSame('3 Days Mount Toubkal Trek', $booking->tour_title);
        $this->assertSame(279.0, (float) $booking->price_per_person);
        $this->assertSame('es', $booking->locale);
        $this->assertSame('website', $booking->source);
        $this->assertNotNull($booking->consent_at);
        $this->assertSame(['pending'], $booking->statusLogs->pluck('to_status')->all());

        Mail::assertSent(BookingReceived::class, fn ($m) => $m->hasTo('ana@example.com'));
        Mail::assertSent(NewBookingNotification::class, fn ($m) => $m->hasTo('team@toubkal-peaks.com') && $m->hasReplyTo('ana@example.com'));
    }

    public function test_the_team_alert_can_go_to_several_inboxes(): void
    {
        Mail::fake();
        config(['mail.booking_notify' => 'info@toubkal-peaks.com, Boss@Example.com;  ops@example.com   INFO@toubkal-peaks.com not-an-email']);

        $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();

        Mail::assertSent(NewBookingNotification::class, 1);                       // one message, several recipients
        Mail::assertSent(NewBookingNotification::class, fn ($m) => $m->hasTo('info@toubkal-peaks.com')
            && $m->hasTo('Boss@Example.com') && $m->hasTo('ops@example.com') && count($m->to) === 3);
        Mail::assertSent(BookingReceived::class, fn ($m) => $m->hasTo('ana@example.com') && count($m->to) === 1);
    }

    public function test_without_a_valid_team_address_the_from_address_is_used(): void
    {
        Mail::fake();
        config(['mail.booking_notify' => 'garbage, also garbage', 'mail.from.address' => 'noreply@mail.toubkal-peaks.com']);

        $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();

        Mail::assertSent(NewBookingNotification::class, fn ($m) => $m->hasTo('noreply@mail.toubkal-peaks.com') && count($m->to) === 1);
    }

    public function test_on_request_and_custom_trips_get_no_estimate(): void
    {
        Mail::fake();
        $onRequest = Tour::where('legacy_wp_id', 1047)->value('id');          // 10 days Northern Morocco

        $this->postJson('/api/v1/bookings', $this->payload(['tour_id' => $onRequest]))
            ->assertCreated()->assertJsonPath('data.estimated_total', null);
        $this->postJson('/api/v1/bookings', $this->payload(['tour_id' => null]))
            ->assertCreated()->assertJsonPath('data.estimated_total', null);

        $this->assertNull(Booking::orderBy('id')->first()->total_price);
        $this->assertNull(Booking::orderByDesc('id')->first()->tour_id);
    }

    public function test_invalid_requests_are_rejected_with_field_errors(): void
    {
        Mail::fake();
        $draft = Tour::where('legacy_wp_id', 1001);
        $draftId = $draft->value('id');
        $draft->update(['status' => 'draft']);

        $this->postJson('/api/v1/bookings', $this->payload(['consent' => false, 'email' => 'nope', 'adults' => 0,
            'start_date' => now()->subDay()->toDateString(), 'locale' => 'xx', 'tour_id' => $draftId]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['consent', 'email', 'adults', 'start_date', 'locale', 'tour_id']);

        $this->postJson('/api/v1/bookings', [])->assertUnprocessable()->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'adults', 'consent']);
        $this->assertSame(0, Booking::count());
        Mail::assertNothingSent();
    }

    public function test_bots_filling_the_honeypot_get_a_fake_success_and_nothing_is_stored(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/bookings', $this->payload(['website' => 'http://spam.example']))->assertStatus(202);

        $this->assertSame(0, Booking::count());
        Mail::assertNothingSent();
    }

    public function test_a_mail_failure_never_loses_the_booking(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('smtp down'));

        $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();

        $this->assertSame(1, Booking::count());
    }

    public function test_the_booking_endpoint_is_rate_limited_per_ip(): void
    {
        Mail::fake();

        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();
        }
        $this->postJson('/api/v1/bookings', $this->payload())->assertStatus(429);
        $this->assertSame(3, Booking::count());
    }
}
