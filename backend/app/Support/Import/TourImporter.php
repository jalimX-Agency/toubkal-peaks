<?php

namespace App\Support\Import;

use App\Enums\PriceMode;
use App\Enums\TourStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Loads the content extracted from the old WordPress site (tours_structured.json, redirects.json).
 * Existing tours are left alone unless $update is true, so later edits made in the admin are never overwritten.
 */
class TourImporter
{
    private const LOCALE = 'en';

    /** Site hubs. Parent slugs form the URL: /treks/toubkal/<tour>. */
    public const CATEGORIES = [
        ['key' => 'treks', 'parent' => null, 'slug' => 'treks', 'name' => 'Treks in Morocco', 'sort' => 10],
        ['key' => 'treks.toubkal', 'parent' => 'treks', 'slug' => 'toubkal', 'name' => 'Mount Toubkal Treks', 'sort' => 11],
        ['key' => 'treks.atlas-valleys-villages', 'parent' => 'treks', 'slug' => 'atlas-valleys-villages', 'name' => 'Atlas Valleys & Berber Villages Treks', 'sort' => 12],
        ['key' => 'treks.regional-treks', 'parent' => 'treks', 'slug' => 'regional-treks', 'name' => 'Regional Treks', 'sort' => 13],
        ['key' => 'sahara-desert-tours', 'parent' => null, 'slug' => 'sahara-desert-tours', 'name' => 'Sahara Desert Tours', 'sort' => 20],
        ['key' => 'morocco-tours', 'parent' => null, 'slug' => 'morocco-tours', 'name' => 'Morocco Tours', 'sort' => 30],
        ['key' => 'day-trips-from-marrakech', 'parent' => null, 'slug' => 'day-trips-from-marrakech', 'name' => 'Day Trips from Marrakech', 'sort' => 40],
    ];

    private const DIFFICULTY = ['easy', 'moderate', 'difficult', 'challenging', 'strenuous'];

    /** @return array<string, Category> keyed by category key */
    public function ensureCategories(): array
    {
        $byKey = [];
        foreach (self::CATEGORIES as $def) {
            $category = Category::updateOrCreate(
                ['key' => $def['key']],
                ['parent_id' => $def['parent'] ? $byKey[$def['parent']]->id : null, 'sort_order' => $def['sort'], 'is_active' => true],
            );
            $category->translations()->updateOrCreate(
                ['locale' => self::LOCALE],
                ['slug' => $def['slug'], 'name' => $def['name']],
            );
            $byKey[$def['key']] = $category;
        }

        return $byKey;
    }

    /**
     * @param  list<array<string,mixed>>  $tours  the "tours" array of tours_structured.json
     * @return array{created:int, updated:int, skipped:int, prices:int, media:int}
     */
    public function importTours(array $tours, bool $publish = false, bool $update = false, string $disk = 'public'): array
    {
        $categories = $this->ensureCategories();
        $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'prices' => 0, 'media' => 0];

        foreach ($tours as $data) {
            $category = $categories[str_replace('/', '.', $data['category'])]
                ?? throw new RuntimeException("Unknown category '{$data['category']}' for tour {$data['id']}.");

            DB::transaction(function () use ($data, $category, $publish, $update, $disk, &$stats) {
                $tour = Tour::withTrashed()->firstOrNew(['legacy_wp_id' => $data['id']]);
                $isNew = ! $tour->exists;
                if (! $isNew && ! $update) {
                    $stats['skipped']++;

                    return;
                }

                $facts = $data['facts'] ?? [];
                $pricing = $data['pricing'] ?? [];
                $tiers = collect($pricing['tiers'] ?? []);
                $hasPrices = $tiers->contains(fn ($t) => ! empty($t['price']));

                $tour->fill([
                    'category_id' => $category->id,
                    'duration_days' => $data['duration_days'] ?? null,
                    'duration_nights' => $data['duration_nights'] ?? null,
                    'difficulty' => $this->difficulty($facts),
                    'max_altitude_m' => $this->altitude($facts),
                    'price_mode' => ($hasPrices ? PriceMode::Tiers : PriceMode::OnRequest)->value,
                    'currency' => 'EUR',
                    'price_basis' => 'per_person',
                ]);
                if ($isNew) {
                    $tour->status = ($publish ? TourStatus::Published : TourStatus::Draft)->value;
                    $tour->published_at = $publish ? now() : null;
                } elseif ($publish) {
                    $tour->status = TourStatus::Published->value;
                    $tour->published_at ??= now();
                }
                $tour->save();
                if ($tour->trashed()) {
                    $tour->restore();
                }

                $slug = basename(rtrim($data['new_url'], '/'));
                TourTranslation::updateOrCreate(
                    ['tour_id' => $tour->id, 'locale' => self::LOCALE],
                    [
                        'slug' => $slug,
                        'title' => $data['title'],
                        'summary' => $data['summary'] ? implode("\n\n", $data['summary']) : null,
                        'highlights' => $data['highlights'] ?: null,
                        'facts' => $facts ?: null,
                        'itinerary' => $data['itinerary'] ?: null,
                        'included' => $data['included'] ?: null,
                        'excluded' => $data['excluded'] ?: null,
                        'packing' => $data['packing'] ?: null,
                        'upgrades' => $data['upgrades'] ?: null,
                        'extra' => $data['other_tabs'] ?: null,
                        // Old Yoast titles ("... | Toubkal Peaks Travel Tours", often 90+ chars) are not imported:
                        // the API generates "<title> | Toubkal Peaks" until a proper title is written.
                        'seo_title' => null,
                        'seo_description' => $data['seo']['description'] ?: null,
                        'translation_status' => 'source',
                    ],
                );

                $tour->prices()->delete();
                foreach ($tiers as $tier) {
                    $tour->prices()->create([
                        'min_pax' => $tier['min'],
                        'max_pax' => $tier['max'] ?? null,
                        'price_per_person' => $tier['price'] ?? null,
                    ]);
                    $stats['prices']++;
                }

                $stats['media'] += $this->attachMedia($tour, $data['images'] ?? [], $disk);
                $stats[$isNew ? 'created' : 'updated']++;
            });
        }

        return $stats;
    }

    /**
     * @param  array<string,string>  $map  old path => new path
     * @return array{imported:int, skipped:int}
     */
    public function importRedirects(array $map): array
    {
        $imported = $skipped = 0;
        foreach ($map as $from => $to) {
            $from = Redirect::normalize($from);
            if ($from === Redirect::normalize($to)) {
                $skipped++;

                continue;
            }
            Redirect::updateOrCreate(
                ['from_path' => $from],
                ['to_path' => $to, 'status_code' => 301, 'is_active' => true, 'notes' => 'wordpress-migration'],
            );
            $imported++;
        }

        return compact('imported', 'skipped');
    }

    /** @param array<string,mixed> $facts */
    private function difficulty(array $facts): ?string
    {
        foreach (['grade', 'trip_level', 'difficulty'] as $key) {
            $value = mb_strtolower((string) ($facts[$key] ?? ''));
            foreach (self::DIFFICULTY as $level) {
                if (str_contains($value, $level)) {
                    return $level;
                }
            }
        }

        return null;
    }

    /** @param array<string,mixed> $facts */
    private function altitude(array $facts): ?int
    {
        $digits = preg_replace('/\D/', '', (string) ($facts['maximum_altitude'] ?? ''));

        return $digits !== '' && (int) $digits <= 9000 ? (int) $digits : null;
    }

    /**
     * @param  array<string,mixed>  $images  {hero, content[], gallery[]} as produced by the scraper
     * @return int number of linked images
     */
    private function attachMedia(Tour $tour, array $images, string $disk): int
    {
        $items = [];
        if (! empty($images['hero'])) {
            $items[] = ['role' => 'hero', 'img' => $images['hero']];
        }
        foreach (array_merge($images['content'] ?? [], $images['gallery'] ?? []) as $img) {
            $items[] = ['role' => 'gallery', 'img' => $img];
        }

        $sync = [];
        $heroId = null;
        foreach ($items as $i => $item) {
            $img = $item['img'];
            $path = preg_replace('#^images/#', '', $img['file']);
            $media = Media::updateOrCreate(['path' => $path], [
                'disk' => $disk,
                'width' => $img['width'] ?? null,
                'height' => $img['height'] ?? null,
                'alt' => ($img['alt'] ?? '') !== '' ? [self::LOCALE => $img['alt']] : null,
                'title' => ($img['title'] ?? '') !== '' ? [self::LOCALE => $img['title']] : null,
            ]);
            if (isset($sync[$media->id])) {
                continue;
            }
            $sync[$media->id] = ['role' => $item['role'], 'sort_order' => $i];
            if ($item['role'] === 'hero') {
                $heroId = $media->id;
            }
        }
        $tour->media()->sync($sync);
        $tour->forceFill(['hero_media_id' => $heroId ?? array_key_first($sync)])->save();

        return count($sync);
    }
}
