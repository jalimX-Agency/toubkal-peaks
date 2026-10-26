<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database. Safe to run on production: no demo users.
     * Tours and redirects come from `php artisan toubkal:import`.
     */
    public function run(): void
    {
        $this->call(CategorySeeder::class);
    }
}
