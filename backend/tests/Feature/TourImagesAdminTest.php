<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class TourImagesAdminTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private Tour $tour;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config(['filesystems.media_disk' => 'public']);
        $this->importRealTours();
        $this->artisan('toubkal:sync-images', ['--disk' => 'public']);
        $this->tour = Tour::where('legacy_wp_id', 1036)->first();
        Sanctum::actingAs(User::factory()->create(['role' => 'staff']));
    }

    private function ids(): array
    {
        return $this->tour->fresh()->media()->pluck('media.id')->all();
    }

    public function test_the_trip_detail_lists_its_photos_main_first(): void
    {
        $images = $this->getJson("/api/v1/admin/tours/{$this->tour->id}")->assertOk()->json('data.images');
        $this->assertCount(8, $images);
        $this->assertTrue($images[0]['is_main']);
        $this->assertFalse($images[1]['is_main']);
    }

    public function test_order_sets_the_main_photo_removes_and_adds_from_the_library(): void
    {
        [$a, $b, $c] = $this->ids();
        $fromLibrary = Media::where('path', 'like', 'site/trips/sa1-%')->value('id');

        $res = $this->putJson("/api/v1/admin/tours/{$this->tour->id}/images", ['ids' => [$c, $a, $fromLibrary]])->assertOk();

        $this->assertSame([$c, $a, $fromLibrary], array_column($res->json('data'), 'id'));
        $this->assertSame($c, $this->tour->fresh()->hero_media_id);
        $this->assertNotContains($b, $this->ids());
        $this->assertTrue(Media::whereKey($b)->exists()); // still in the library
    }

    public function test_a_new_photo_is_stored_and_added_at_the_end(): void
    {
        $res = $this->post("/api/v1/admin/tours/{$this->tour->id}/images", ['photo' => UploadedFile::fake()->image('valley.jpg', 1600, 1067)], ['Accept' => 'application/json'])
            ->assertCreated();

        $last = collect($res->json('data'))->last();
        $this->assertSame(1600, $last['width']);
        $media = Media::find($last['id']);
        $this->assertStringStartsWith('site/trips/5-days-ait-bougmez-happy-valley-trek-', $media->path);
        Storage::disk('public')->assertExists($media->path);
        $this->assertCount(9, $this->ids());

        // too small or not an image
        $this->post("/api/v1/admin/tours/{$this->tour->id}/images", ['photo' => UploadedFile::fake()->image('tiny.jpg', 400, 300)], ['Accept' => 'application/json'])->assertUnprocessable();
        $this->post("/api/v1/admin/tours/{$this->tour->id}/images", ['photo' => UploadedFile::fake()->create('doc.pdf', 20, 'application/pdf')], ['Accept' => 'application/json'])->assertUnprocessable();
    }

    public function test_a_photo_description_is_edited_per_language(): void
    {
        $id = $this->ids()[1];
        $this->patchJson("/api/v1/admin/tours/{$this->tour->id}/images/{$id}", ['alt' => ['en' => 'Walnut trees', 'fr' => 'Noyers', 'es' => '']])->assertOk();
        $this->assertSame(['en' => 'Walnut trees', 'fr' => 'Noyers'], Media::find($id)->alt);

        $other = Media::where('path', 'like', 'site/trips/sa1-%')->value('id'); // not a photo of this trip
        $this->patchJson("/api/v1/admin/tours/{$this->tour->id}/images/{$other}", ['alt' => ['en' => 'x']])->assertNotFound();
    }

    public function test_the_library_is_searchable(): void
    {
        $res = $this->getJson('/api/v1/admin/media?q=Merzouga')->assertOk();
        $this->assertGreaterThan(0, $res->json('meta.total'));
        foreach ($res->json('data') as $img) {
            $this->assertStringContainsStringIgnoringCase('merzouga', json_encode($img['alt']).$img['url']);
        }
    }
}
