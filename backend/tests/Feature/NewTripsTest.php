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
        $this->assertSame($before + 5, Tour::count());

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

        // the 4-day Atlas trek costs exactly what "4 Days Berber Villages Trek Atlas" costs, and sits in the same category
        $four = TourTranslation::firstWhere('slug', '4-days-atlas-mountains-trek-three-valleys-berber-villages')->tour->load('category', 'prices', 'media');
        $reference = Tour::where('legacy_wp_id', 1012)->first()->load('prices', 'category');
        $this->assertSame($reference->category->key, $four->category->key);
        $tiers = fn ($t) => $t->prices->map(fn ($p) => [$p->min_pax, $p->max_pax, (float) $p->price_per_person])->all();
        $this->assertSame($tiers($reference), $tiers($four));
        $this->assertSame([[1, 1, 459.0], [2, 3, 289.0], [4, 7, 259.0], [8, 12, 239.0]], $tiers($four));
        $this->assertSame('treks.atlas-valleys-villages', $four->category->key);
        $this->assertSame(4, $four->duration_days);
        $this->assertSame(2270, $four->max_altitude_m);
        $this->assertCount(4, $four->translate('en')->itinerary);
        $this->assertCount(12, $four->media);

        // French, Spanish and German: own addresses, marked "machine" so the team reads them, and served in their language
        $this->assertEqualsCanonicalizing(['en', 'fr', 'es', 'de'], $four->translations->pluck('locale')->all());
        foreach (['fr' => '4-jours-trek-atlas-trois-vallees-villages-berberes', 'es' => '4-dias-trekking-atlas-tres-valles-pueblos-bereberes', 'de' => '4-tage-atlas-trekking-drei-taeler-berberdoerfer'] as $locale => $slug) {
            $row = $four->translations->firstWhere('locale', $locale);
            $this->assertSame($slug, $row->slug);
            $this->assertSame('machine', $row->translation_status);
            $this->assertCount(4, $row->itinerary);
            $this->getJson("/api/v1/tours/{$slug}?locale={$locale}")->assertOk()->assertJsonPath('data.locale', $locale);
        }
        $this->assertSame('source', $four->translations->firstWhere('locale', 'en')->translation_status);

        $this->getJson('/api/v1/tours/13-days-morocco-4x4-hiking-adventure?locale=en')->assertOk()->assertJsonPath('data.pricing.mode', 'on_request');

        // a second run changes nothing, and an edit made in the admin is kept
        $casa->translate('en')->update(['title' => 'Edited in the admin']);
        $this->artisan('toubkal:import-new-trips')->assertSuccessful();
        $this->assertSame($before + 5, Tour::count());
        $this->assertSame('Edited in the admin', $casa->fresh()->translate('en')->title);
    }
}
