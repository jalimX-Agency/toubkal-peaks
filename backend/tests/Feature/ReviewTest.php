<?php

namespace Tests\Feature;

use App\Enums\ReviewSource;
use App\Enums\ReviewStatus;
use App\Models\Review;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private function review(array $attrs = []): Review
    {
        return Review::create(array_merge([
            'source' => ReviewSource::Google,
            'author_name' => 'John',
            'rating' => 5,
            'body' => 'Great trek.',
            'status' => ReviewStatus::Published,
        ], $attrs));
    }

    public function test_summary_counts_only_published_reviews(): void
    {
        $this->review(['rating' => 5]);
        $this->review(['rating' => 4, 'source' => ReviewSource::Tripadvisor]);
        $this->review(['rating' => 1, 'status' => ReviewStatus::Pending]);
        $this->review(['rating' => 1, 'status' => ReviewStatus::Hidden]);

        $this->assertSame(['count' => 2, 'average' => 4.5], Review::summary());
        $this->assertSame(['count' => 0, 'average' => null], Review::summary(999));
    }

    public function test_the_same_external_review_cannot_be_imported_twice(): void
    {
        $this->review(['external_id' => 'g-123']);
        $this->review(['external_id' => 'g-123', 'source' => ReviewSource::Tripadvisor]); // other source is fine

        $this->expectException(QueryException::class);
        $this->review(['external_id' => 'g-123']);
    }
}
