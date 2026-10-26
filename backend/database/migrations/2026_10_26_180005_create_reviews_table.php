<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('source', 30);                       // google | tripadvisor | viator | ...
            $table->string('external_id', 120)->nullable();     // id on the source platform (dedupe on import)
            $table->foreignId('tour_id')->nullable()->constrained('tours')->nullOnDelete();
            $table->string('author_name', 120);
            $table->string('author_country', 80)->nullable();
            $table->unsignedTinyInteger('rating');              // 1-5
            $table->string('title', 255)->nullable();
            $table->text('body');
            $table->char('language', 2)->nullable();
            $table->date('reviewed_at')->nullable();
            $table->string('url', 500)->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->unique(['source', 'external_id']);
            $table->index(['tour_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
