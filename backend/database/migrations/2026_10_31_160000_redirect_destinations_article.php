<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** The old "Top tourist destinations in Morocco" article now has its own new page: /destinations. */
return new class extends Migration
{
    private const FROM = '/top-tourist-destinations-in-morocco-discover-the-beauty-with-toubkal-peaks-travel/';

    public function up(): void
    {
        DB::table('redirects')->where('from_path', self::FROM)->update(['to_path' => '/destinations', 'updated_at' => now()]);
        cache()->forget('api.redirects.v1');
    }

    public function down(): void
    {
        DB::table('redirects')->where('from_path', self::FROM)->update(['to_path' => '/trips']);
    }
};
