<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('disk', 20)->default('public');
            $table->string('path', 191)->unique();        // relative to the disk root, e.g. 2019/09/ourika-valley.jpg
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->index();
            $table->string('mime', 60)->nullable();
            $table->unsignedInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->json('alt')->nullable();              // {"en": "...", "fr": "..."}
            $table->json('title')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
