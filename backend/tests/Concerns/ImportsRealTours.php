<?php

namespace Tests\Concerns;

use App\Support\Import\TourImporter;

trait ImportsRealTours
{
    /** Loads the 59 scraped tours (and optionally publishes them) into the test database. */
    protected function importRealTours(bool $publish = true): void
    {
        $tours = json_decode(file_get_contents(database_path('data/tours_structured.json')), true)['tours'];
        $importer = new TourImporter;
        $importer->importTours($tours, publish: $publish);
        $importer->importRedirects(json_decode(file_get_contents(database_path('data/redirects.json')), true));
    }
}
