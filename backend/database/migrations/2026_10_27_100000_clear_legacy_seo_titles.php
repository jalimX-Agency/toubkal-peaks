<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The first import copied the old WordPress/Yoast titles into seo_title. They carry the retired brand
     * suffix and are often too long, so they are cleared; the API falls back to "<title> | Toubkal Peaks".
     * Safe: no admin exists yet, so nobody could have written a real seo_title.
     */
    public function up(): void
    {
        DB::table('tour_translations')->where('translation_status', 'source')->update(['seo_title' => null]);
    }

    public function down(): void
    {
        // legacy titles cannot be restored
    }
};
