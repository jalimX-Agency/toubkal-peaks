<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class BookingSpamTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private const VERIFY = 'challenges.cloudflare.com/*';

    /** @return array<string,mixed> */
    private function payload(array $override = []): array
    {
        return array_replace([
            'tour_id' => Tour::where('legacy_wp_id', 1001)->value('id'),
            'first_name' => 'Ana', 'last_name' => 'Lopez', 'email' => 'ana@example.com', 'country' => 'Spain',
            'start_date' => now()->addMonth()->toDateString(), 'adults' => 2, 'children' => 0,
            'consent' => true, 'conditions_accepted' => true, 'locale' => 'en',
        ], $override);
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->importRealTours();
        Mail::fake();
    }

    public function test_without_a_secret_key_nothing_is_checked(): void
    {
        Http::fake();
        $this->postJson('/api/v1/bookings', $this->payload())->assertCreated();
        Http::assertNothingSent();
    }

    public function test_with_a_secret_key_a_missing_or_refused_token_is_turned_back_and_a_good_one_passes(): void
    {
        config(['services.turnstile.secret' => 'test-secret']);

        // no token: refused without asking Cloudflare; a refused token: refused; then a good one
        Http::fake([self::VERIFY => Http::sequence()->push(['success' => false])->push(['success' => true])]);
        $this->postJson('/api/v1/bookings', $this->payload())->assertStatus(422)->assertJsonValidationErrors('turnstile');
        $this->postJson('/api/v1/bookings', $this->payload(['turnstile' => 'bad']))->assertStatus(422)->assertJsonValidationErrors('turnstile');
        $this->assertSame(0, Booking::count());

        $this->postJson('/api/v1/bookings', $this->payload(['turnstile' => 'good']), ['X-Client-IP' => '203.0.113.9'])->assertCreated();
        $this->assertSame(1, Booking::count());
        Http::assertSent(fn ($request) => $request['response'] === 'good' && $request['remoteip'] === '203.0.113.9' && $request['secret'] === 'test-secret');
    }

    public function test_a_turnstile_outage_does_not_lose_a_real_booking(): void
    {
        config(['services.turnstile.secret' => 'test-secret']);
        Http::fake([self::VERIFY => Http::response('down', 500)]);

        $this->postJson('/api/v1/bookings', $this->payload(['turnstile' => 'any']))->assertCreated();
    }

    public function test_messages_with_several_links_are_dropped_silently_but_one_link_is_fine(): void
    {
        $spam = $this->payload(['special_requests' => 'Cheap seo http://a.example and https://b.example and www.c.example']);
        $this->postJson('/api/v1/bookings', $spam)->assertStatus(202);
        $this->assertSame(0, Booking::count());

        $this->postJson('/api/v1/bookings', $this->payload(['special_requests' => 'Our itinerary: https://example.com/plan']))->assertCreated();
        $this->assertSame(1, Booking::count());
    }

    public function test_the_limit_counts_each_visitor_by_the_address_the_website_forwards(): void
    {
        RateLimiter::clear('bookings');
        // 3 per minute: the fourth request of the same visitor is refused, another visitor is not
        foreach (range(1, 3) as $i) {
            $this->postJson('/api/v1/bookings', $this->payload(['email' => "a{$i}@example.com"]), ['X-Client-IP' => '198.51.100.1'])->assertCreated();
        }
        $this->postJson('/api/v1/bookings', $this->payload(['email' => 'a4@example.com']), ['X-Client-IP' => '198.51.100.1'])->assertStatus(429);
        $this->postJson('/api/v1/bookings', $this->payload(['email' => 'b1@example.com']), ['X-Client-IP' => '198.51.100.2'])->assertCreated();
    }
}
