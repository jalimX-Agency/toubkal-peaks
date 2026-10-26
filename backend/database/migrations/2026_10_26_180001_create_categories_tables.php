<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('key', 80)->unique();          // stable code, e.g. "treks.toubkal"
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('category_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->char('locale', 2);
            $table->string('slug', 120);                  // one URL segment, translated per locale
            $table->string('name', 160);
            $table->text('intro')->nullable();
            $table->string('seo_title', 160)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestamps();

            $table->unique(['category_id', 'locale']);
            $table->index(['locale', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_translations');
        Schema::dropIfExists('categories');
    }
};
