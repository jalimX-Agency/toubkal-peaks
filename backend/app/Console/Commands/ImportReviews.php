<?php

namespace App\Console\Commands;

use App\Enums\ReviewSource;
use App\Enums\ReviewStatus;
use App\Models\Review;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class ImportReviews extends Command
{
    protected $signature = 'toubkal:import-reviews
        {--file= : Reviews file (default: database/data/reviews.json)}
        {--pending : Save them as "to approve" instead of publishing them}';

    protected $description = 'Add real traveller reviews (Tripadvisor, Google...) from database/data/reviews.json; a review already imported (same source and id, or same author, date and text) is skipped';

    public function handle(): int
    {
        $file = $this->option('file') ?: database_path('data/reviews.json');
        $reviews = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR)['reviews'];
        $created = $skipped = 0;

        foreach ($reviews as $i => $r) {
            $check = Validator::make($r, [
                'source' => ['required', 'in:'.implode(',', array_column(ReviewSource::cases(), 'value'))],
                'author_name' => ['required', 'string', 'max:120'],
                'author_country' => ['nullable', 'string', 'max:80'],
                'rating' => ['required', 'integer', 'between:1,5'],
                'title' => ['nullable', 'string', 'max:255'],
                'body' => ['required', 'string', 'min:20'],
                'language' => ['nullable', 'size:2'],
                'reviewed_at' => ['nullable', 'date'],
                'url' => ['nullable', 'url:https'],
                'external_id' => ['nullable', 'string', 'max:120'],
            ]);
            if ($check->fails()) {
                $this->error('Review #'.($i + 1).": {$check->errors()->first()}");

                return self::FAILURE;
            }
            $duplicate = ! empty($r['external_id'])
                ? Review::where('source', $r['source'])->where('external_id', $r['external_id'])->exists()
                : Review::where('source', $r['source'])->where('author_name', $r['author_name'])->where('reviewed_at', $r['reviewed_at'] ?? null)->where('body', $r['body'])->exists();
            if ($duplicate) {
                $skipped++;

                continue;
            }
            Review::create([
                'source' => $r['source'],
                'external_id' => $r['external_id'] ?? null,
                'author_name' => $r['author_name'],
                'author_country' => $r['author_country'] ?? null,
                'rating' => $r['rating'],
                'title' => $r['title'] ?? null,
                'body' => $r['body'],
                'language' => $r['language'] ?? null,
                'reviewed_at' => $r['reviewed_at'] ?? null,
                'url' => $r['url'] ?? null,
                'status' => ($this->option('pending') ? ReviewStatus::Pending : ReviewStatus::Published)->value,
                'is_featured' => (bool) ($r['is_featured'] ?? false),
            ]);
            $created++;
        }
        $this->info("{$created} reviews added, {$skipped} already there.");

        return self::SUCCESS;
    }
}
