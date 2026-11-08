<?php

namespace Tests\Feature;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\SiteEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SiteEventsTest extends TestCase
{
    use RefreshDatabase;

    private function event(array $override = []): array
    {
        return array_replace(['event' => 'whatsapp', 'page' => '/en/treks/toubkal/2-days-mount-toubkal-trek', 'tour_slug' => '2-days-mount-toubkal-trek',
            'locale' => 'en', 'channel' => 'google_ads', 'device' => 'mobile', 'country' => 'us'], $override);
    }

    public function test_an_event_is_stored_without_any_personal_data(): void
    {
        $this->postJson('/api/v1/events', $this->event())->assertNoContent();

        $row = SiteEvent::first();
        $this->assertSame(['whatsapp', 'google_ads', 'mobile', 'US'], [$row->event, $row->channel, $row->device, $row->country]);
        // nothing that identifies a visitor is stored: only these columns exist
        $this->assertSame(['id', 'event', 'page', 'tour_slug', 'locale', 'channel', 'device', 'country', 'created_at'], array_keys($row->getAttributes()));
    }

    public function test_bad_events_are_refused_and_the_admin_is_not_counted(): void
    {
        $this->postJson('/api/v1/events', $this->event(['event' => 'purchase']))->assertStatus(422);
        $this->postJson('/api/v1/events', $this->event(['page' => 'https://evil.example/']))->assertStatus(422);
        $this->postJson('/api/v1/events', $this->event(['channel' => 'whatever']))->assertStatus(422);
        $this->postJson('/api/v1/events', $this->event(['page' => '/admin/bookings']))->assertNoContent();
        $this->assertSame(0, SiteEvent::count());
    }

    public function test_the_dashboard_numbers_count_visits_clicks_and_requests_by_channel(): void
    {
        Mail::fake();
        Sanctum::actingAs(User::factory()->create());

        foreach (range(1, 4) as $i) {
            $this->postJson('/api/v1/events', $this->event(['event' => 'visit', 'channel' => $i <= 3 ? 'google_ads' : 'direct', 'tour_slug' => null]))->assertNoContent();
        }
        $this->postJson('/api/v1/events', $this->event())->assertNoContent();
        $this->postJson('/api/v1/events', $this->event(['event' => 'phone', 'channel' => 'direct']))->assertNoContent();
        // an old event is outside a 7-day window
        SiteEvent::create($this->event(['event' => 'email']) + ['created_at' => now()->subDays(20)]);

        $make = fn (array $o) => Booking::create($o + ['first_name' => 'A', 'last_name' => 'B', 'email' => 'a@example.test', 'adults' => 2, 'children' => 0,
            'currency' => 'EUR', 'locale' => 'en']);
        $make(['channel' => 'google_ads']);
        $make(['channel' => 'google_ads', 'status' => BookingStatus::Cancelled->value]); // spam that was cancelled does not count
        $make([]);

        $seven = $this->getJson('/api/v1/admin/engagement?days=7')->assertOk()->json('data');
        $this->assertSame(['visits' => 4, 'whatsapp' => 1, 'phone' => 1, 'email' => 0, 'requests' => 2], $seven['totals']);
        $this->assertCount(7, $seven['daily']);
        $ads = collect($seven['channels'])->firstWhere('channel', 'google_ads');
        $this->assertSame([3, 1, 0, 1], [$ads['visits'], $ads['whatsapp'], $ads['phone'], $ads['requests']]);
        $this->assertSame('/en/treks/toubkal/2-days-mount-toubkal-trek', $seven['pages'][0]['page']);
        $this->assertSame('US', $seven['countries'][0]['country']);

        $ninety = $this->getJson('/api/v1/admin/engagement?days=90')->assertOk()->json('data');
        $this->assertSame(1, $ninety['totals']['email']);
        $this->getJson('/api/v1/admin/engagement?days=5')->assertStatus(422);
    }

    public function test_a_booking_keeps_the_channel_the_visitor_came_from(): void
    {
        Mail::fake();
        $this->postJson('/api/v1/bookings', ['first_name' => 'Ana', 'last_name' => 'Lopez', 'email' => 'ana@example.com', 'adults' => 2,
            'consent' => true, 'locale' => 'en', 'channel' => 'google_ads'])->assertCreated();
        $this->assertSame('google_ads', Booking::first()->channel);

        $this->postJson('/api/v1/bookings', ['first_name' => 'Ana', 'last_name' => 'Lopez', 'email' => 'ana@example.com', 'adults' => 2,
            'consent' => true, 'locale' => 'en', 'channel' => 'unknown-thing'])->assertStatus(422);
    }
}
