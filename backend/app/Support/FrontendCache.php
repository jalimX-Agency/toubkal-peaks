<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Tells the Next.js site which cached data changed (POST /api/revalidate with a cache tag).
 *
 * Tags are collected during the request or command and sent once each when it ends, so saving a
 * tour with its translations, prices and media makes one call, not twenty. Does nothing while
 * FRONTEND_URL or REVALIDATE_SECRET is not set (local development, tests).
 */
class FrontendCache
{
    /** Every tag the website caches API data under (see frontend/src/lib/api.ts). */
    public const ALL = ['tours', 'categories', 'reviews'];

    /** @var array<string, true> */
    private array $pending = [];

    private bool $flushScheduled = false;

    public function revalidate(string ...$tags): void
    {
        foreach ($tags as $tag) {
            $this->pending[$tag] = true;
        }
        if (! $this->flushScheduled) {
            $this->flushScheduled = true;
            app()->terminating(fn () => $this->flush());
        }
    }

    /** Send the pending tags now. @return array<string, bool> tag => accepted by the website */
    public function flush(): array
    {
        $tags = array_keys($this->pending);
        $this->pending = [];
        $this->flushScheduled = false;

        $url = $this->endpoint();
        $secret = config('services.frontend.revalidate_secret');
        if ($tags === [] || ! $url || ! $secret) {
            return [];
        }

        $results = [];
        foreach ($tags as $tag) {
            try {
                $results[$tag] = Http::timeout(5)
                    ->withHeaders(['x-revalidate-secret' => $secret])
                    ->post($url, ['tag' => $tag])
                    ->successful();
            } catch (Throwable $e) {
                $results[$tag] = false;
            }
            if (! $results[$tag]) {
                Log::warning("Website cache not refreshed for tag \"{$tag}\" ({$url}).");
            }
        }

        return $results;
    }

    /** FRONTEND_URL may list several origins for CORS: the first one is the website. */
    private function endpoint(): ?string
    {
        $first = trim(explode(',', (string) config('services.frontend.url'))[0]);

        return $first === '' ? null : rtrim($first, '/').'/api/revalidate';
    }
}
