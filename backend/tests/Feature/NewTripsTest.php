<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class NewTripsTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_the_import_creates_the_new_trips_once_with_prices_photos_and_category(): void
    {
        $this->importRealTours();
        $before = Tour::count();

        $this->artisan('toubkal:import-new-trips')->assertSuccessful();
        $this->assertSame($before + 4, Tour::count());

        $balloon = TourTranslation::firstWhere('slug', 'marrakech-sunrise-hot-air-balloon-flight')->tour->load('category', 'prices', 'media');
        $this->assertSame('day-trips-from-marrakech', $balloon->category->key);
        $this->assertSame('published', $balloon->status->value);
        $this->assertSame([199.0], $balloon->prices->map(fn ($p) => (float) $p->price_per_person)->all());
        $this->assertNotNull($balloon->hero_media_id);
        $this->assertCount(7, $balloon->media);

        $casa = TourTranslation::firstWhere('slug', 'casablanca-full-day-trip-from-marrakech')->tour->load('prices');
        $this->assertSame([229.0, 129.0, 89.0, 59.0], $casa->prices->map(fn ($p) => (float) $p->price_per_person)->all());

        $long = TourTranslation::firstWhere('slug', '13-days-morocco-4x4-hiking-adventure')->tour->load('category');
        $this->assertSame('morocco-tours', $long->category->key);
        $this->assertSame('on_request', $long->price_mode->value);
        $this->assertCount(13, $long->translate('en')->itinerary);
        $this->assertSame(12, $long->duration_nights);

        $nine = TourTranslation::firstWhere('slug', '9-days-morocco-atlas-mountains-trekking-sahara-desert-experience')->tour->load('category', 'media');
        $this->assertSame('morocco-tours', $nine->category->key);
        $this->assertSame('on_request', $nine->price_mode->value);
        $this->assertSame(9, $nine->duration_days);
        $this->assertCount(9, $nine->translate('en')->itinerary);
        $this->assertCount(12, $nine->media);

        $this->getJson('/api/v1/tours/13-days-morocco-4x4-hiking-adventure?locale=en')->assertOk()->assertJsonPath('data.pricing.mode', 'on_request');

        // a second run changes nothing, and an edit made in the admin is kept
        $casa->translate('en')->update(['title' => 'Edited in the admin']);
        $this->artisan('toubkal:import-new-trips')->assertSuccessful();
        $this->assertSame($before + 4, Tour::count());
        $this->assertSame('Edited in the admin', $casa->fresh()->translate('en')->title);
    }
}
