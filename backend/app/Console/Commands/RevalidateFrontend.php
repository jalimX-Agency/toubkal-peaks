<?php

namespace App\Console\Commands;

use App\Support\FrontendCache;
use Illuminate\Console\Command;

class RevalidateFrontend extends Command
{
    protected $signature = 'toubkal:revalidate {tags?* : Cache tags to refresh (default: all of them)}';

    protected $description = 'Make the website reload its data from the API now (tours, categories, reviews)';

    public function handle(FrontendCache $cache): int
    {
        if (! config('services.frontend.url') || ! config('services.frontend.revalidate_secret')) {
            $this->error('Set FRONTEND_URL and REVALIDATE_SECRET in .env first.');

            return self::FAILURE;
        }

        $cache->revalidate(...($this->argument('tags') ?: FrontendCache::ALL));
        $results = $cache->flush();
        $this->table(['tag', 'result'], array_map(fn ($tag, $ok) => [$tag, $ok ? 'refreshed' : 'failed'], array_keys($results), $results));

        return in_array(false, $results, true) ? self::FAILURE : self::SUCCESS;
    }
}
