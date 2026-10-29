<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Support\FrontendCache;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class FrontendCacheTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    private function configure(): void
    {
        config([
            'services.frontend.url' => 'https://site.test, http://localhost:3000',
            'services.frontend.revalidate_secret' => 'shh',
        ]);
    }

    public function test_saving_a_tour_and_its_translation_refreshes_the_tours_tag_once(): void
    {
        $this->importRealTours();
        app(FrontendCache::class)->flush(); // the import's own changes (not configured yet: nothing sent)
        $this->configure();
        Http::fake(['site.test/*' => Http::response(['revalidated' => true])]);

        $tour = Tour::with('translations')->first();
        $tour->translations->first()->update(['title' => 'New title']);
        $tour->touch();
        app(FrontendCache::class)->flush();

        Http::assertSentCount(1);
        Http::assertSent(fn (Request $r) => $r->url() === 'https://site.test/api/revalidate'
            && $r->header('x-revalidate-secret') === ['shh']
            && $r['tag'] === 'tours');
    }

    public function test_nothing_is_sent_without_a_secret(): void
    {
        config(['services.frontend.url' => 'https://site.test', 'services.frontend.revalidate_secret' => null]);
        Http::fake();

        app(FrontendCache::class)->revalidate('tours');

        $this->assertSame([], app(FrontendCache::class)->flush());
        Http::assertNothingSent();
    }

    public function test_the_command_refreshes_every_tag_and_reports_failures(): void
    {
        $this->configure();
        Http::fake(fn (Request $r) => Http::response([], $r['tag'] === 'reviews' ? 500 : 200));

        $this->artisan('toubkal:revalidate')->assertExitCode(1);

        Http::assertSentCount(3);
    }
}
