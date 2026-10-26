<?php

namespace Database\Seeders;

use App\Support\Import\TourImporter;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        app(TourImporter::class)->ensureCategories();
    }
}
