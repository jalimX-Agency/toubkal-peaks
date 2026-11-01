<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Proof that the customer accepted the trekking conditions of a Mount Toubkal trip: when, and which text. */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('conditions_accepted_at')->nullable()->after('consent_at');
            $table->string('conditions_version', 40)->nullable()->after('conditions_accepted_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['conditions_accepted_at', 'conditions_version']);
        });
    }
};
