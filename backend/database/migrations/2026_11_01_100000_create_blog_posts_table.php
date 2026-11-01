<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Blog articles: one slug for every language, the texts as {"en": "...", "fr": "..."}. */
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->json('title');
            $table->json('excerpt')->nullable();
            $table->json('content');                    // HTML per language, filtered to the blog vocabulary
            $table->string('image_url', 500)->nullable();
            $table->json('image_alt')->nullable();
            $table->string('category', 30)->nullable(); // one of BlogPost::CATEGORIES
            $table->string('author', 80)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable()->index(); // null: draft
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
