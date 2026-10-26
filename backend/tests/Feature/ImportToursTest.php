<?php

namespace Tests\Feature;

use App\Enums\PriceMode;
use App\Enums\TourStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\Tour;
use App\Support\Import\TourImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImportToursTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string,mixed> */
    private function tourData(array $override = []): array
    {
        return array_replace_recursive([
            'id' => 1001,
            'category' => 'treks/toubkal',
            'new_url' => '/treks/toubkal/3-days-mount-toubkal-trek/',
            'title' => '3 Days Mount Toubkal Trek',
            'duration_days' => 3,
            'duration_nights' => null,
            'seo' => ['title' => '', 'description' => ''],
            'summary' => ['A classic summit trek.'],
            'highlights' => [],
            'facts' => ['grade' => 'Difficult', 'maximum_altitude' => '4,167 m'],
            'itinerary' => [['day' => 1, 'title' => 'Marrakech - Refuge', 'stats' => ['meals' => 'Dinner'], 'accommodation' => 'Refuge', 'body' => ['Drive to Imlil.']]],
            'included' => ['Guide'],
            'excluded' => ['Flights'],
            'packing' => [],
            'upgrades' => [],
            'other_tabs' => [],
            'pricing' => ['tiers' => [
                ['label' => '1', 'min' => 1, 'max' => 1, 'price' => 439.0],
                ['label' => '2-3', 'min' => 2, 'max' => 3, 'price' => 279.0],
                ['label' => '4-7', 'min' => 4, 'max' => 7, 'price' => 249.0],
                ['label' => '8-12', 'min' => 8, 'max' => 12, 'price' => 239.0],
            ]],
            'images' => [
                'hero' => ['file' => 'images/2019/09/3d.jpg', 'alt' => 'Toubkal', 'title' => '3d', 'width' => 900, 'height' => 450],
                'content' => [['file' => 'images/2019/09/3d.jpg', 'alt' => 'Toubkal', 'title' => '3d', 'width' => 900, 'height' => 450]],
                'gallery' => [['file' => 'images/2019/09/extra.jpg', 'alt' => '', 'title' => '', 'width' => 100, 'height' => 100]],
            ],
        ], $override);
    }

    public function test_it_creates_categories_with_translated_url_paths(): void
    {
        $categories = (new TourImporter)->ensureCategories();

        $this->assertCount(7, $categories);
        $this->assertSame('treks/toubkal', $categories['treks.toubkal']->path('en'));
        $this->assertSame('sahara-desert-tours', $categories['sahara-desert-tours']->path('en'));
    }

    public function test_it_imports_a_tiered_tour_as_a_draft(): void
    {
        $stats = (new TourImporter)->importTours([$this->tourData()]);

        $this->assertSame(1, $stats['created']);
        $this->assertSame(4, $stats['prices']);
        $tour = Tour::with(['translations', 'prices', 'media', 'hero'])->firstOrFail();
        $this->assertSame(TourStatus::Draft, $tour->status);
        $this->assertSame(PriceMode::Tiers, $tour->price_mode);
        $this->assertSame('difficult', $tour->difficulty);
        $this->assertSame(4167, $tour->max_altitude_m);
        $this->assertSame('3-days-mount-toubkal-trek', $tour->translate('en')->slug);
        $this->assertSame(239.0, $tour->fromPrice());
        $this->assertSame(279.0, $tour->priceFor(3));
        $this->assertSame('2019/09/3d.jpg', $tour->hero->path);
        $this->assertCount(2, $tour->media);              // hero + extra, duplicate content image not repeated
        $this->assertSame('Toubkal', $tour->hero->altFor('en'));
    }

    public function test_tours_without_a_price_block_are_on_request_and_publish_flag_works(): void
    {
        $data = $this->tourData();
        $data['pricing']['tiers'] = [];
        (new TourImporter)->importTours([$data], publish: true);

        $tour = Tour::firstOrFail()->load('prices');
        $this->assertSame(PriceMode::OnRequest, $tour->price_mode);
        $this->assertSame(TourStatus::Published, $tour->status);
        $this->assertNull($tour->fromPrice());
        $this->assertCount(0, $tour->prices);
    }

    public function test_unavailable_group_size_has_no_price(): void
    {
        $data = $this->tourData();
        $data['pricing']['tiers'][0]['price'] = null;
        (new TourImporter)->importTours([$data]);

        $tour = Tour::firstOrFail()->load('prices');
        $this->assertNull($tour->priceFor(1));
        $this->assertSame(279.0, $tour->priceFor(2));
    }

    public function test_reimport_does_not_overwrite_admin_edits_unless_update_is_set(): void
    {
        $importer = new TourImporter;
        $importer->importTours([$this->tourData()]);
        $tour = Tour::firstOrFail();
        $tour->translate('en')->update(['title' => 'Edited in admin']);

        $stats = $importer->importTours([$this->tourData()]);
        $this->assertSame(1, $stats['skipped']);
        $this->assertSame('Edited in admin', $tour->fresh()->load('translations')->translate('en')->title);

        $stats = $importer->importTours([$this->tourData()], update: true);
        $this->assertSame(1, $stats['updated']);
        $this->assertSame('3 Days Mount Toubkal Trek', $tour->fresh()->load('translations')->translate('en')->title);
        $this->assertSame(1, Tour::count());
        $this->assertSame(4, Tour::firstOrFail()->prices()->count());   // replaced, not duplicated
        $this->assertSame(2, Media::count());
    }

    public function test_unknown_category_fails_loudly(): void
    {
        $this->expectException(\RuntimeException::class);
        (new TourImporter)->importTours([$this->tourData(['category' => 'nope'])]);
    }

    public function test_redirects_are_normalized_and_self_redirects_skipped(): void
    {
        $result = (new TourImporter)->importRedirects([
            '/old-tour/' => '/treks/toubkal/new-tour/',
            '/Contact' => '/contact/',          // same path after normalization
        ]);

        $this->assertSame(['imported' => 1, 'skipped' => 1], $result);
        $this->assertSame('/treks/toubkal/new-tour/', Redirect::findFor('/OLD-tour?utm=x')->to_path);
        $this->assertNull(Redirect::findFor('/missing/'));
    }

    public function test_the_real_scraped_dataset_imports_cleanly(): void
    {
        $tours = json_decode(file_get_contents(database_path('data/tours_structured.json')), true)['tours'];
        $redirects = json_decode(file_get_contents(database_path('data/redirects.json')), true);

        $stats = (new TourImporter)->importTours($tours);
        (new TourImporter)->importRedirects($redirects);

        $this->assertSame(59, $stats['created']);
        $this->assertSame(59, Tour::count());
        $this->assertSame(0, Tour::whereNull('category_id')->count());
        $this->assertSame(11, Tour::where('price_mode', 'on_request')->count());
        $this->assertSame(59, \App\Models\TourTranslation::count());
        $this->assertSame(7, Category::count());
        $this->assertSame(72, Redirect::count());
        // every redirect target is a tour, hub or other known path (no dangling "/UNCLASSIFIED/" etc.)
        $this->assertSame(0, Redirect::where('to_path', 'like', '%UNCLASSIFIED%')->count());
    }
}
