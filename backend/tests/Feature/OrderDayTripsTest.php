<?php

namespace Tests\Feature;

use App\Console\Commands\OrderDayTrips;
use App\Models\TourTranslation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class OrderDayTripsTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_the_four_owner_trips_come_first_on_the_day_trips_page_and_the_others_keep_their_order(): void
    {
        $this->importRealTours();
        $this->artisan('toubkal:import-new-trips')->assertSuccessful();

        $slugs = fn () => collect($this->getJson('/api/v1/tours?category=day-trips-from-marrakech&locale=en&per_page=100')->assertOk()->json('data'))->pluck('slug');
        $before = $slugs()->reject(fn ($s) => in_array($s, OrderDayTrips::FIRST, true))->values();

        $this->artisan('toubkal:order-day-trips')->assertSuccessful();
        $after = $slugs();

        $this->assertSame(OrderDayTrips::FIRST, $after->take(4)->all());
        $this->assertSame($before->all(), $after->slice(4)->values()->all());

        // running it again changes nothing
        $this->artisan('toubkal:order-day-trips')->assertSuccessful();
        $this->assertSame($after->all(), $slugs()->all());
        $this->assertNotNull(TourTranslation::firstWhere('slug', OrderDayTrips::FIRST[0]));
    }
}
