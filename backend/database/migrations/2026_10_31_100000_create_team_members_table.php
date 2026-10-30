<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** The people shown on the website's About page, managed from the admin. */
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);                 // as shown: the owner's full name, first names for the others
            $table->json('role');                       // {"en": "...", "fr": "..."}
            $table->json('bio');                        // {"en": ["paragraph", ...], "fr": [...]}
            $table->json('photo_alt')->nullable();
            $table->foreignId('photo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
