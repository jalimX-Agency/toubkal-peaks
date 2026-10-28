<?php

namespace App\Console\Commands;

use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportTranslations extends Command
{
    protected $signature = 'toubkal:import-translations
        {--locale=* : Only these locales (default: every file found)}
        {--dir= : Folder holding <locale>.json files (default: database/data/translations)}
        {--force : Also overwrite translations edited by hand (status "reviewed")}';

    protected $description = 'Import translated tour content (FR, ES, DE...) from JSON files, matched to tours by their old WordPress id';

    /** Statuses written by people in the admin: never replaced by an import unless --force. */
    private const PROTECTED = ['reviewed'];

    public function handle(): int
    {
        $dir = rtrim($this->option('dir') ?: database_path('data/translations'), '/\\');
        $locales = $this->option('locale') ?: array_map(fn ($f) => basename($f, '.json'), glob($dir.'/*.json') ?: []);
        if ($locales === []) {
            $this->error("No translation files in {$dir}.");

            return self::FAILURE;
        }

        $rows = [];
        foreach ($locales as $locale) {
            if (! in_array($locale, config('locales.supported'), true) || $locale === config('locales.fallback')) {
                $this->warn("Skipping {$locale}: not a translation locale.");

                continue;
            }
            $file = "{$dir}/{$locale}.json";
            if (! is_file($file)) {
                $this->error("File not found: {$file}");

                return self::FAILURE;
            }
            $data = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
            $rows[] = [$locale, ...$this->import($locale, $data['tours'] ?? [])];
        }

        $this->table(['locale', 'imported', 'kept (reviewed)', 'unknown tour'], $rows);

        return self::SUCCESS;
    }

    /** @return array{int,int,int} */
    private function import(string $locale, array $tours): array
    {
        $imported = $kept = $unknown = 0;
        $tourIds = Tour::withTrashed()->pluck('id', 'legacy_wp_id');

        foreach ($tours as $item) {
            $tourId = $tourIds[$item['id']] ?? null;
            if ($tourId === null) {
                $unknown++;

                continue;
            }
            $existing = TourTranslation::where(['tour_id' => $tourId, 'locale' => $locale])->first();
            if ($existing && in_array($existing->translation_status, self::PROTECTED, true) && ! $this->option('force')) {
                $kept++;

                continue;
            }

            DB::transaction(fn () => TourTranslation::updateOrCreate(
                ['tour_id' => $tourId, 'locale' => $locale],
                [
                    'slug' => $this->uniqueSlug($locale, Str::slug($item['slug'] ?: $item['title']), $tourId),
                    'title' => $item['title'],
                    'summary' => $item['summary'] ?: null,
                    'highlights' => $item['highlights'] ?: null,
                    'facts' => $item['facts'] ?: null,
                    'itinerary' => $item['itinerary'] ?: null,
                    'included' => $item['included'] ?: null,
                    'excluded' => $item['excluded'] ?: null,
                    'packing' => $item['packing'] ?: null,
                    'upgrades' => $item['upgrades'] ?: null,
                    'seo_title' => null,
                    'seo_description' => $item['seo_description'] ?? null,
                    'translation_status' => 'machine',
                ],
            ));
            $imported++;
        }

        return [$imported, $kept, $unknown];
    }

    /** Slugs are unique per locale: add the tour id if another tour already uses this one. */
    private function uniqueSlug(string $locale, string $slug, int $tourId): string
    {
        $taken = TourTranslation::where(['locale' => $locale, 'slug' => $slug])->where('tour_id', '!=', $tourId)->exists();

        return $taken ? "{$slug}-{$tourId}" : $slug;
    }
}
