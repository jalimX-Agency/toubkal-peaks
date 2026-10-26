<?php

namespace App\Console\Commands;

use App\Enums\TourStatus;
use App\Models\Tour;
use Illuminate\Console\Command;

class PublishTours extends Command
{
    protected $signature = 'toubkal:publish
        {--all : Every tour}
        {--category= : Only tours of this category key (a parent such as "treks" includes its children)}
        {--draft : Move the tours back to draft instead of publishing them}';

    protected $description = 'Publish (or unpublish) imported tours so the public API starts returning them';

    public function handle(): int
    {
        if (! $this->option('all') && ! $this->option('category')) {
            $this->error('Choose --all or --category=<key>.');

            return self::FAILURE;
        }

        $query = Tour::query();
        if ($key = $this->option('category')) {
            $query->whereHas('category', fn ($c) => $c->where('key', $key)->orWhereHas('parent', fn ($p) => $p->where('key', $key)));
        }

        $publish = ! $this->option('draft');
        $count = 0;
        foreach ($query->get() as $tour) {
            $tour->forceFill([
                'status' => ($publish ? TourStatus::Published : TourStatus::Draft)->value,
                'published_at' => $publish ? ($tour->published_at ?? now()) : null,
            ])->save();
            $count++;
        }
        $this->info(($publish ? 'Published ' : 'Moved to draft: ').$count.' tour(s).');

        return $count > 0 ? self::SUCCESS : self::FAILURE;
    }
}
