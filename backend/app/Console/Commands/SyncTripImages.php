<?php

namespace App\Console\Commands;

use App\Models\Media;
use App\Models\Tour;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncTripImages extends Command
{
    protected $signature = 'toubkal:sync-images
        {--file= : Manifest file (default: database/data/media/trip-images.json)}
        {--disk= : Disk holding the files (default: MEDIA_DISK)}
        {--dry-run : Report what would change without saving}';

    protected $description = 'Give each trip its photos from the image manifest (files already uploaded to the media disk); the first photo becomes the main one';

    public function handle(): int
    {
        $file = $this->option('file') ?: database_path('data/media/trip-images.json');
        if (! is_file($file)) {
            $this->error("File not found: {$file}");

            return self::FAILURE;
        }
        $data = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
        $disk = $this->option('disk') ?: config('filesystems.media_disk');
        $dry = (bool) $this->option('dry-run');
        $tourIds = Tour::withTrashed()->pluck('id', 'legacy_wp_id');

        $stats = ['tours updated' => 0, 'images linked' => 0, 'unknown tour' => 0];
        DB::transaction(function () use ($data, $disk, $dry, $tourIds, &$stats) {
            $mediaIds = [];
            foreach ($data['images'] as $key => $img) {
                $attributes = [
                    'disk' => $disk,
                    'mime' => 'image/jpeg',
                    'width' => $img['width'],
                    'height' => $img['height'],
                    'alt' => $img['alt'],
                ];
                $mediaIds[$key] = $dry ? 0 : Media::updateOrCreate(['path' => $data['base'].$img['file']], $attributes)->id;
            }

            foreach ($data['tours'] as $legacyId => $keys) {
                $tour = isset($tourIds[$legacyId]) ? Tour::withTrashed()->find($tourIds[$legacyId]) : null;
                if ($tour === null) {
                    $stats['unknown tour']++;

                    continue;
                }
                $sync = [];
                foreach (array_values($keys) as $i => $key) {
                    $sync[$mediaIds[$key]] = ['role' => $i === 0 ? 'hero' : 'gallery', 'sort_order' => $i];
                }
                if (! $dry) {
                    $tour->media()->sync($sync);
                    // saving the tour also tells the website to refresh its pages
                    $tour->forceFill(['hero_media_id' => $mediaIds[$keys[0]]])->save();
                    $tour->touch();
                }
                $stats['tours updated']++;
                $stats['images linked'] += count($keys);
            }
        });

        $this->table(array_keys($stats), [array_values($stats)]);
        $dry && $this->comment('Dry run: nothing was saved.');

        return self::SUCCESS;
    }
}
