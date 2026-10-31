<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Old WordPress addresses left without a page: the destinations article pointed to a /destinations
 * page that was never built, and two old posts had no redirect. They go to the closest new pages.
 */
return new class extends Migration
{
    private const REDIRECTS = [
        '/top-tourist-destinations-in-morocco-discover-the-beauty-with-toubkal-peaks-travel/' => '/trips',
        '/schools/' => '/trips',
        '/one-day-trip/' => '/day-trips-from-marrakech',
    ];

    public function up(): void
    {
        foreach (self::REDIRECTS as $from => $to) {
            DB::table('redirects')->updateOrInsert(
                ['from_path' => $from],
                ['to_path' => $to, 'status_code' => 301, 'is_active' => true, 'notes' => 'Old site page without its own new page', 'updated_at' => now(), 'created_at' => now()],
            );
        }
        // the API keeps its list for a few minutes
        cache()->forget('api.redirects.v1');
    }

    public function down(): void
    {
        DB::table('redirects')->whereIn('from_path', ['/schools/', '/one-day-trip/'])->delete();
        DB::table('redirects')->where('from_path', array_key_first(self::REDIRECTS))->update(['to_path' => '/destinations/']);
    }
};
