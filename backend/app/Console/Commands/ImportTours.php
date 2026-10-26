<?php

namespace App\Console\Commands;

use App\Support\Import\TourImporter;
use Illuminate\Console\Command;

class ImportTours extends Command
{
    protected $signature = 'toubkal:import
        {--tours= : Path to tours_structured.json (default: database/data/tours_structured.json)}
        {--redirects= : Path to redirects.json (default: database/data/redirects.json)}
        {--publish : Publish imported tours (default: draft)}
        {--update : Overwrite tours that already exist (default: leave them untouched)}
        {--disk= : Filesystem disk that holds the images (default: MEDIA_DISK)}';

    protected $description = 'Import tours, categories, images and redirects extracted from the old WordPress site';

    public function handle(TourImporter $importer): int
    {
        $toursFile = $this->option('tours') ?: database_path('data/tours_structured.json');
        $redirectsFile = $this->option('redirects') ?: database_path('data/redirects.json');

        foreach ([$toursFile, $redirectsFile] as $file) {
            if (! is_file($file)) {
                $this->error("File not found: {$file}");

                return self::FAILURE;
            }
        }

        $tours = json_decode(file_get_contents($toursFile), true, 512, JSON_THROW_ON_ERROR)['tours'];
        $redirects = json_decode(file_get_contents($redirectsFile), true, 512, JSON_THROW_ON_ERROR);

        $stats = $importer->importTours($tours, (bool) $this->option('publish'), (bool) $this->option('update'), $this->option('disk') ?: config('filesystems.media_disk'));
        $this->table(['created', 'updated', 'skipped', 'price rows', 'images linked'], [[
            $stats['created'], $stats['updated'], $stats['skipped'], $stats['prices'], $stats['media'],
        ]]);

        $r = $importer->importRedirects($redirects);
        $this->info("Redirects: {$r['imported']} imported, {$r['skipped']} skipped.");

        return self::SUCCESS;
    }
}
