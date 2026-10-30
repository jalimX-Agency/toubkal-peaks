<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class SyncTripImagesTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_every_trip_gets_its_photos_with_the_first_as_main_photo(): void
    {
        $this->importRealTours();

        $this->artisan('toubkal:sync-images', ['--disk' => 'public'])->assertSuccessful();

        $manifest = json_decode(file_get_contents(database_path('data/media/trip-images.json')), true);
        $tour = Tour::where('legacy_wp_id', 1036)->with('media', 'hero')->first();
        $keys = $manifest['tours']['1036'];

        $this->assertSame($manifest['base'].$manifest['images'][$keys[0]]['file'], $tour->hero->path);
        $this->assertCount(count($keys), $tour->media);
        $this->assertSame('hero', $tour->media->first()->pivot->role);
        $this->assertNotSame('', $tour->hero->altFor('fr')); // falls back to the English alt text

        // every published trip has at least six photos
        foreach (Tour::withCount('media')->get() as $t) {
            $this->assertGreaterThanOrEqual(6, $t->media_count, "tour {$t->legacy_wp_id}");
        }

        // running it again changes nothing
        $this->artisan('toubkal:sync-images', ['--disk' => 'public'])->assertSuccessful();
        $this->assertCount(count($keys), $tour->fresh()->media);
    }

    public function test_the_manifest_images_respect_the_size_limit(): void
    {
        $manifest = json_decode(file_get_contents(database_path('data/media/trip-images.json')), true);
        foreach ($manifest['images'] as $key => $img) {
            $this->assertLessThanOrEqual(1920, $img['width'], $key);
            $this->assertNotSame('', $img['alt']['en'], $key);
        }
    }
}
