<?php

namespace Tests\Feature;

use App\Enums\ReviewSource;
use App\Enums\ReviewStatus;
use App\Models\Review;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_draft_tours_are_not_exposed(): void
    {
        $this->importRealTours(publish: false);

        $this->getJson('/api/v1/tours')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/tours/3-days-mount-toubkal-trek')->assertNotFound();
    }

    public function test_tour_list_returns_cards_with_paths_prices_and_images(): void
    {
        $this->importRealTours();

        $response = $this->getJson('/api/v1/tours?per_page=60')->assertOk();
        $response->assertJsonCount(59, 'data')->assertJsonPath('meta.total', 59);

        $card = collect($response->json('data'))->firstWhere('slug', '3-days-mount-toubkal-trek');
        $this->assertSame('treks/toubkal/3-days-mount-toubkal-trek', $card['path']);
        $this->assertSame('3 Days Mount Toubkal Trek', $card['title']);
        $this->assertSame(3, $card['duration_days']);
        $this->assertSame('tiers', $card['price_mode']);
        $this->assertEquals(239, $card['from_price']);
        $this->assertSame('EUR', $card['currency']);
        $this->assertSame('difficult', $card['difficulty']);
        $this->assertSame('Mount Toubkal Treks', $card['category']['name']);
        $this->assertStringEndsWith('2019/09/3d-mount-toubkal.jpg', $card['hero']['url']);

        $onRequest = collect($response->json('data'))->firstWhere('slug', '10-days-the-northern-morocco-tour');
        $this->assertSame('on_request', $onRequest['price_mode']);
        $this->assertNull($onRequest['from_price']);
    }

    public function test_tours_can_be_filtered_by_category_and_a_parent_includes_its_children(): void
    {
        $this->importRealTours();

        $this->getJson('/api/v1/tours?category=treks&per_page=60')->assertJsonPath('meta.total', 24);
        $this->getJson('/api/v1/tours?category=treks.toubkal')->assertJsonPath('meta.total', 7);
        $this->getJson('/api/v1/tours?category=day-trips-from-marrakech')->assertJsonPath('meta.total', 13);
        $this->getJson('/api/v1/tours?category=nope')->assertJsonPath('meta.total', 0);

        Tour::where('legacy_wp_id', 1001)->update(['is_featured' => true]);
        $this->getJson('/api/v1/tours?featured=1')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/v1/tours?per_page=5')->assertJsonCount(5, 'data');
    }

    public function test_tour_detail_has_everything_the_page_needs(): void
    {
        $this->importRealTours();

        $d = $this->getJson('/api/v1/tours/3-days-mount-toubkal-trek')->assertOk()->json('data');

        $this->assertSame('treks/toubkal', $d['category']['path']);
        $this->assertCount(3, $d['itinerary']);
        $this->assertSame('Marrakech – Toubkal Refuge', $d['itinerary'][0]['title']);
        $this->assertNotEmpty($d['included']);
        $this->assertNotEmpty($d['excluded']);
        $this->assertSame(4167, $d['max_altitude_m']);
        $this->assertSame('tiers', $d['pricing']['mode']);
        $this->assertEquals(239, $d['pricing']['from_price']);
        $this->assertCount(4, $d['pricing']['tiers']);
        $this->assertSame([1, 2, 4, 8], array_column($d['pricing']['tiers'], 'min_pax'));
        $this->assertNotNull($d['images']['hero']['url']);
        $this->assertCount(3, $d['related']);
        $this->assertNotContains($d['id'], array_column($d['related'], 'id'));
        $this->assertSame('3 Days Mount Toubkal Trek | Toubkal Peaks', $d['seo']['title']);   // generated fallback
        $this->assertNotSame('', $d['seo']['description']);
        $this->assertLessThanOrEqual(160, mb_strlen($d['seo']['description']));
        $this->assertSame([['locale' => 'en', 'path' => 'treks/toubkal/3-days-mount-toubkal-trek']], $d['alternates']);
        $this->assertSame(['count' => 0, 'average' => null], $d['reviews']['summary']);
    }

    public function test_untranslated_locales_fall_back_to_english_and_say_so(): void
    {
        $this->importRealTours();

        $d = $this->getJson('/api/v1/tours/3-days-mount-toubkal-trek?locale=fr')->assertOk()->json('data');

        $this->assertSame('en', $d['locale']);
        $this->assertSame('fr', $d['requested_locale']);
        $this->assertSame('3 Days Mount Toubkal Trek', $d['title']);

        $this->getJson('/api/v1/tours/3-days-mount-toubkal-trek?locale=xx')->assertJsonPath('data.requested_locale', 'en');
        $this->getJson('/api/v1/tours/does-not-exist')->assertNotFound();
    }

    public function test_category_tree_has_translated_paths_and_published_counts(): void
    {
        $this->importRealTours();

        $tree = $this->getJson('/api/v1/categories')->assertOk()->json('data');

        $this->assertSame(['treks', 'sahara-desert-tours', 'morocco-tours', 'day-trips-from-marrakech'], array_column($tree, 'key'));
        $treks = $tree[0];
        $this->assertSame('treks', $treks['path']);
        $this->assertSame(24, $treks['tours_count']);
        $this->assertSame(['treks/toubkal', 'treks/atlas-valleys-villages', 'treks/regional-treks'], array_column($treks['children'], 'path'));
        $this->assertSame([7, 9, 8], array_column($treks['children'], 'tours_count'));
    }

    public function test_reviews_list_shows_only_published_ones_with_a_summary(): void
    {
        $this->importRealTours();
        $tourId = Tour::where('legacy_wp_id', 1001)->value('id');
        $make = fn (array $a) => Review::create($a + ['source' => ReviewSource::Google, 'author_name' => 'A', 'body' => 'Nice', 'rating' => 5, 'status' => ReviewStatus::Published]);
        $make(['tour_id' => $tourId, 'rating' => 5, 'is_featured' => true]);
        $make(['tour_id' => $tourId, 'rating' => 4, 'source' => ReviewSource::Tripadvisor]);
        $make(['rating' => 5]);
        $make(['rating' => 1, 'status' => ReviewStatus::Pending]);

        $all = $this->getJson('/api/v1/reviews')->assertOk();
        $all->assertJsonCount(3, 'data')->assertJsonPath('summary.count', 3);
        $this->getJson('/api/v1/reviews?featured=1')->assertJsonCount(1, 'data');
        $this->getJson("/api/v1/reviews?tour={$tourId}")->assertJsonCount(2, 'data')->assertJsonPath('summary.average', 4.5);

        $detail = $this->getJson('/api/v1/tours/3-days-mount-toubkal-trek')->json('data.reviews');
        $this->assertSame(['count' => 2, 'average' => 4.5], $detail['summary']);
        $this->assertCount(2, $detail['latest']);
    }

    public function test_redirects_endpoint_lists_the_old_urls(): void
    {
        $this->importRealTours();

        $data = $this->getJson('/api/v1/redirects')->assertOk()->json('data');

        $this->assertCount(72, $data);
        $this->assertContains(
            ['from' => '/3-days-mount-toubkal/', 'to' => '/treks/toubkal/3-days-mount-toubkal-trek/', 'status' => 301],
            $data,
        );
    }

    public function test_read_endpoints_send_cache_headers(): void
    {
        $this->importRealTours();

        $cache = $this->getJson('/api/v1/tours')->headers->get('Cache-Control');

        $this->assertStringContainsString('public', $cache);
        $this->assertStringContainsString('max-age=60', $cache);
        $this->assertStringContainsString('stale-while-revalidate=300', $cache);
    }
}
