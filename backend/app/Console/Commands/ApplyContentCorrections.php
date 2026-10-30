<?php

namespace App\Console\Commands;

use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Console\Command;

class ApplyContentCorrections extends Command
{
    protected $signature = 'toubkal:apply-corrections
        {--file= : Corrections file (default: database/data/corrections/en.json)}
        {--dry-run : Report what would change without saving}';

    protected $description = 'Fix known errors in the imported tour content; a field is only replaced while it still holds the original text';

    public function handle(): int
    {
        $file = $this->option('file') ?: database_path('data/corrections/en.json');
        if (! is_file($file)) {
            $this->error("File not found: {$file}");

            return self::FAILURE;
        }
        $data = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        $locale = $data['locale'] ?? config('locales.fallback');
        $tourIds = Tour::withTrashed()->pluck('id', 'legacy_wp_id');

        $counts = ['applied' => 0, 'already done' => 0, 'edited since (kept)' => 0, 'unknown tour' => 0];
        foreach ($data['corrections'] ?? [] as $c) {
            if ($c['field'] === 'prices') {
                $counts[$this->correctPrices($tourIds[$c['id']] ?? null, $c)]++;

                continue;
            }

            $translation = isset($tourIds[$c['id']])
                ? TourTranslation::where(['tour_id' => $tourIds[$c['id']], 'locale' => $locale])->first()
                : null;
            if ($translation === null) {
                $counts['unknown tour']++;

                continue;
            }

            $current = $translation->{$c['field']};
            if ($current == $c['after']) {
                $counts['already done']++;
            } elseif ($current == $c['before']) {
                $translation->{$c['field']} = $c['after'];
                $this->option('dry-run') || $translation->save();
                $counts['applied']++;
            } else {
                // Someone changed this field in the admin after the import: their version wins.
                $counts['edited since (kept)']++;
                $this->warn("Kept tour {$c['id']} {$c['field']}: edited since the import.");
            }
        }

        $this->table(array_keys($counts), [array_values($counts)]);

        return self::SUCCESS;
    }

    /**
     * Price tiers as [people from, people to, price per person] rows. Replaced only while they still match
     * "before"; the tour is then marked as price-checked, like a save in the admin.
     */
    private function correctPrices(?int $tourId, array $c): string
    {
        $tour = $tourId ? Tour::withTrashed()->with('prices')->find($tourId) : null;
        if ($tour === null) {
            return 'unknown tour';
        }

        $rows = fn ($prices) => $prices->sortBy('min_pax')->map(fn ($p) => [(int) $p->min_pax, $p->max_pax === null ? null : (int) $p->max_pax, (float) $p->price_per_person])->values()->all();
        $current = $rows($tour->prices);
        if ($current == $c['after']) {
            return 'already done';
        }
        if ($current != $c['before']) {
            $this->warn("Kept tour {$c['id']} prices: edited since the import.");

            return 'edited since (kept)';
        }
        if (! $this->option('dry-run')) {
            $tour->prices()->delete();
            foreach ($c['after'] as [$min, $max, $price]) {
                $tour->prices()->create(['min_pax' => $min, 'max_pax' => $max, 'price_per_person' => $price]);
            }
            $tour->update(['price_reviewed_at' => now()]);
        }

        return 'applied';
    }
}
