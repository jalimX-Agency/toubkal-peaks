<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->unique();
            $table->string('status', 20)->default('draft')->index();
            $table->unsignedSmallInteger('duration_days')->nullable();
            $table->unsignedSmallInteger('duration_nights')->nullable();
            $table->string('difficulty', 30)->nullable();
            $table->unsignedSmallInteger('max_altitude_m')->nullable();
            $table->unsignedTinyInteger('group_min')->nullable();
            $table->unsignedTinyInteger('group_max')->nullable();
            $table->string('price_mode', 20)->default('on_request');
            $table->char('currency', 3)->default('EUR');
            $table->string('price_basis', 20)->default('per_person');
            $table->timestamp('price_reviewed_at')->nullable();   // null = imported price not yet checked
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('hero_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status', 'sort_order']);
        });

        Schema::create('tour_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->char('locale', 2);
            $table->string('slug', 160);
            $table->string('title', 255);
            $table->text('summary')->nullable();
            $table->json('highlights')->nullable();   // ["...", ...]
            $table->json('facts')->nullable();        // {"best_time": "...", ...}
            $table->json('itinerary')->nullable();    // [{day,title,stats,accommodation,body[]}]
            $table->json('included')->nullable();
            $table->json('excluded')->nullable();
            $table->json('packing')->nullable();      // [{group, items[]}]
            $table->json('upgrades')->nullable();
            $table->json('extra')->nullable();        // other info tabs
            $table->string('seo_title', 160)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->string('translation_status', 20)->default('source'); // source | machine | reviewed
            $table->timestamps();

            $table->unique(['tour_id', 'locale']);
            $table->unique(['locale', 'slug']);
        });

        Schema::create('tour_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->unsignedTinyInteger('min_pax');
            $table->unsignedTinyInteger('max_pax')->nullable();
            $table->decimal('price_per_person', 10, 2)->nullable(); // null = not available for this group size
            $table->date('valid_from')->nullable();                 // seasonal pricing later
            $table->date('valid_to')->nullable();
            $table->timestamps();

            $table->index(['tour_id', 'min_pax']);
        });

        Schema::create('tour_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('role', 20)->default('gallery'); // hero | gallery
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->unique(['tour_id', 'media_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_media');
        Schema::dropIfExists('tour_prices');
        Schema::dropIfExists('tour_translations');
        Schema::dropIfExists('tours');
    }
};
