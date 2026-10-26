<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Support\ArtisanQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ImportsRealTours;
use Tests\TestCase;

class PublishToursTest extends TestCase
{
    use ImportsRealTours, RefreshDatabase;

    public function test_it_needs_a_scope(): void
    {
        $this->importRealTours(publish: false);

        $this->artisan('toubkal:publish')->assertExitCode(1);
        $this->assertSame(0, Tour::published()->count());
    }

    public function test_it_publishes_by_category_then_everything_then_back_to_draft(): void
    {
        $this->importRealTours(publish: false);

        $this->artisan('toubkal:publish', ['--category' => 'treks.toubkal'])->assertExitCode(0);
        $this->assertSame(7, Tour::published()->count());
        $this->getJson('/api/v1/tours')->assertJsonPath('meta.total', 7);

        $this->artisan('toubkal:publish', ['--category' => 'treks'])->assertExitCode(0);
        $this->assertSame(24, Tour::published()->count());

        $this->artisan('toubkal:publish', ['--all' => true])->assertExitCode(0);
        $this->assertSame(59, Tour::published()->count());
        $this->assertSame(0, Tour::published()->whereNull('published_at')->count());

        $this->artisan('toubkal:publish', ['--all' => true, '--draft' => true])->assertExitCode(0);
        $this->assertSame(0, Tour::published()->count());
        $this->assertSame(0, Tour::whereNotNull('published_at')->count());
    }

    public function test_it_can_be_queued_on_the_server(): void
    {
        $queue = new ArtisanQueue('unused');

        $this->assertSame(['toubkal:publish', ['--all' => true]], $queue->parse('toubkal:publish --all'));
        $this->assertSame(['toubkal:publish', ['--category' => 'treks.toubkal']], $queue->parse('toubkal:publish --category=treks.toubkal'));
    }
}
