<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class TourCategoriesTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private function tourIn(string $key): Tour
    {
        return Tour::whereHas('category', fn ($c) => $c->where('key', $key))->orderBy('id')->firstOrFail();
    }

    private function slugsIn(string $category): array
    {
        return collect($this->getJson("/api/v1/tours?category={$category}&locale=en&per_page=100")->assertOk()->json('data'))->pluck('id')->all();
    }

    public function test_a_trip_can_be_listed_in_extra_categories_and_every_category_page_shows_it(): void
    {
        $this->importRealTours();
        Sanctum::actingAs(User::factory()->create());
        $tour = $this->tourIn('day-trips-from-marrakech');
        $main = $tour->category->key;

        $this->assertNotContains($tour->id, $this->slugsIn('treks'));

        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['extra_categories' => ['treks.atlas-valleys-villages', $main]])
            ->assertOk()
            ->assertJsonPath('data.category', $main)
            // the main category is never repeated among the extra ones
            ->assertJsonPath('data.extra_categories', ['treks.atlas-valleys-villages']);

        // the extra category and its parent list the trip; the main one still does
        $this->assertContains($tour->id, $this->slugsIn('treks.atlas-valleys-villages'));
        $this->assertContains($tour->id, $this->slugsIn('treks'));
        $this->assertContains($tour->id, $this->slugsIn($main));
        // its address does not change
        $card = collect($this->getJson('/api/v1/tours?category=treks&locale=en&per_page=100')->json('data'))->firstWhere('id', $tour->id);
        $this->assertSame([$main, 'treks.atlas-valleys-villages'], $card['categories']);
        $this->assertStringStartsWith('/day-trips-from-marrakech/', '/'.ltrim($card['path'], '/'));

        // removing the extra category takes it out of the other pages again
        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['extra_categories' => []])->assertOk()->assertJsonPath('data.extra_categories', []);
        $this->assertNotContains($tour->id, $this->slugsIn('treks'));
    }

    public function test_changing_the_main_category_moves_the_trip_and_redirects_the_old_address(): void
    {
        $this->importRealTours();
        Sanctum::actingAs(User::factory()->create());
        $tour = $this->tourIn('day-trips-from-marrakech');
        $slug = $tour->translate('en')->slug;

        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['category' => 'morocco-tours'])
            ->assertOk()->assertJsonPath('data.category', 'morocco-tours');

        $this->assertContains($tour->id, $this->slugsIn('morocco-tours'));
        $this->assertNotContains($tour->id, $this->slugsIn('day-trips-from-marrakech'));
        $this->getJson("/api/v1/tours/{$slug}?locale=en")->assertOk()->assertJsonPath('data.path', "morocco-tours/{$slug}");
        $this->assertDatabaseHas('redirects', ['from_path' => "/day-trips-from-marrakech/{$slug}/", 'to_path' => "/morocco-tours/{$slug}", 'status_code' => 301]);
    }

    public function test_an_unknown_category_is_refused_and_the_toubkal_conditions_follow_extra_categories(): void
    {
        $this->importRealTours();
        Sanctum::actingAs(User::factory()->create());
        $tour = $this->tourIn('day-trips-from-marrakech');

        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['category' => 'nope'])->assertStatus(422);
        $this->assertFalse($tour->fresh()->requiresTrekkingConditions());

        $this->patchJson("/api/v1/admin/tours/{$tour->id}", ['extra_categories' => [Tour::TOUBKAL_CATEGORY]])->assertOk();
        $this->assertTrue($tour->fresh()->requiresTrekkingConditions());
    }
}
