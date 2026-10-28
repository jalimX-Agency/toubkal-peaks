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
}
