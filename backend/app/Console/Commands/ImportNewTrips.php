<?php

namespace App\Console\Commands;

use App\Enums\PriceMode;
use App\Enums\TourStatus;
use App\Models\Category;
use App\Models\Media;
use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ImportNewTrips extends Command
{
    protected $signature = 'toubkal:import-new-trips
        {--file= : One data file (default: every database/data/new-trips/*.json)}
        {--draft : Create the trips as drafts instead of publishing them}';

    protected $description = 'Create the trips of database/data/new-trips (texts, prices, photos from the trip image manifest); a trip whose English address already exists is left as it is, so edits made in the admin are kept';

    public function handle(): int
    {
        $files = $this->option('file') ? [$this->option('file')] : glob(database_path('data/new-trips/*.json'));
        $manifest = json_decode(file_get_contents(database_path('data/media/trip-images.json')), true, 512, JSON_THROW_ON_ERROR);
        $disk = config('filesystems.media_disk');
        $created = $kept = 0;

        foreach ($files as $file) {
            foreach (json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR)['trips'] as $trip) {
                $en = $trip['translations']['en'] ?? null;
                $check = Validator::make($trip + ['en' => $en], [
                    'category' => ['required', 'exists:categories,key'],
                    'en.slug' => ['required', 'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/', 'max:160'],
                    'en.title' => ['required', 'string', 'max:255'],
                    'price.mode' => ['required', 'in:tiers,on_request'],
                ]);
                if ($check->fails()) {
                    $this->error("{$file}: ".$check->errors()->first());

                    return self::FAILURE;
                }
                if (TourTranslation::where('locale', 'en')->where('slug', $en['slug'])->exists()) {
                    $this->line("kept (already there): {$en['slug']}");
                    $kept++;

                    continue;
                }
                foreach ($trip['images'] as $key) {
                    if (! isset($manifest['images'][$key])) {
                        $this->error("{$en['slug']}: unknown photo \"{$key}\"");

                        return self::FAILURE;
                    }
                }

                DB::transaction(function () use ($trip, $manifest, $disk) {
                    $category = Category::where('key', $trip['category'])->firstOrFail();
                    $tour = Tour::create([
                        'category_id' => $category->id,
                        'status' => ($this->option('draft') ? TourStatus::Draft : TourStatus::Published)->value,
                        'duration_days' => $trip['duration_days'],
                        'duration_nights' => $trip['duration_nights'],
                        'difficulty' => $trip['difficulty'],
                        'max_altitude_m' => $trip['max_altitude_m'],
                        'price_mode' => PriceMode::from($trip['price']['mode'])->value,
                        'currency' => $trip['price']['currency'],
                        'price_basis' => 'per_person',
                        'price_reviewed_at' => now(),            // the owner gave these prices
                        'sort_order' => (int) Tour::where('category_id', $category->id)->max('sort_order') + 1,
                        'published_at' => $this->option('draft') ? null : now(),
                    ]);

                    foreach ($trip['translations'] as $locale => $t) {
                        $tour->translations()->create([
                            'locale' => $locale,
                            'slug' => $t['slug'],
                            'title' => $t['title'],
                            'summary' => $t['summary'] ?? null,
                            'highlights' => $t['highlights'] ?? [],
                            'facts' => $t['facts'] ?? [],
                            'itinerary' => $t['itinerary'] ?? [],
                            'included' => $t['included'] ?? [],
                            'excluded' => $t['excluded'] ?? [],
                            'packing' => $t['packing'] ?? [],
                            'upgrades' => $t['upgrades'] ?? [],
                            'seo_title' => $t['seo_title'] ?? null,
                            'seo_description' => $t['seo_description'] ?? null,
                            'translation_status' => $locale === config('locales.default') ? 'source' : 'reviewed',
                        ]);
                    }

                    foreach ($trip['price']['tiers'] as $tier) {
                        $tour->prices()->create($tier);
                    }

                    $sync = [];
                    foreach (array_values($trip['images']) as $i => $key) {
                        $img = $manifest['images'][$key];
                        $media = Media::updateOrCreate(['path' => $manifest['base'].$img['file']], [
                            'disk' => $disk, 'mime' => 'image/jpeg', 'width' => $img['width'], 'height' => $img['height'], 'alt' => $img['alt'],
                        ]);
                        $sync[$media->id] = ['role' => $i === 0 ? 'hero' : 'gallery', 'sort_order' => $i];
                        if ($i === 0) {
                            $tour->forceFill(['hero_media_id' => $media->id])->save();
                        }
                    }
                    $tour->media()->sync($sync);
                    $tour->touch();     // the website refreshes its pages
                });
                $this->info("created: {$en['slug']}");
                $created++;
            }
        }
        $this->info("{$created} trips created, {$kept} kept.");

        return self::SUCCESS;
    }
}
