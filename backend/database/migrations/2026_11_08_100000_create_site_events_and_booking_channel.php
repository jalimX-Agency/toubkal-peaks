<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Anonymous counts of what visitors do on the website (visits and clicks on WhatsApp, phone and email),
     * shown in the admin. No cookie, no IP address and no identifier is stored: one row is one event.
     * Bookings also keep the channel the visitor came from.
     */
    public function up(): void
    {
        Schema::create('site_events', function (Blueprint $table) {
            $table->id();
            $table->string('event', 16);                    // visit | whatsapp | phone | email
            $table->string('page', 255);                    // address of the page, without the query string
            $table->string('tour_slug', 190)->nullable();   // the trip page it happened on, if any
            $table->string('locale', 5)->nullable();
            $table->string('channel', 24)->nullable();      // google_ads | google_organic | search | social | referral | direct
            $table->string('device', 10)->nullable();       // mobile | tablet | desktop
            $table->string('country', 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['created_at', 'event']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('channel', 24)->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('channel');
        });
        Schema::dropIfExists('site_events');
    }
};
