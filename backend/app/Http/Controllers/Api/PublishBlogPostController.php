<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Support\BlogPostInput;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/**
 * POST /api/blog-posts, for scripts and scheduled writing sessions (key: BLOG_API_KEY).
 *
 * Flat body: title, excerpt, content and imageAlt in English, the other languages as titleFr,
 * contentDe…; slug, image (https URL), category, author, featured, published (default true).
 * Create only: an existing slug is refused (409), so an automated run never replaces an article
 * edited in the admin. Errors are listed all at once (400) so the caller can fix them in one retry.
 */
class PublishBlogPostController extends Controller
{
    private const FIELDS = ['title' => 'title', 'excerpt' => 'excerpt', 'content' => 'content', 'imageAlt' => 'image_alt'];

    public function store(Request $request): JsonResponse
    {
        if (! $request->isJson() || ! is_array(json_decode($request->getContent(), true))) {
            return response()->json(['error' => 'Body must be JSON'], 400);
        }
        $body = $request->json()->all();

        if (is_string($body['slug'] ?? null) && BlogPost::where('slug', $body['slug'])->exists()) {
            return response()->json(['error' => "A post with slug \"{$body['slug']}\" already exists"], 409);
        }

        $input = [
            'slug' => $body['slug'] ?? null,
            'image_url' => ($body['image'] ?? '') === '' ? null : $body['image'],
            'category' => ($body['category'] ?? '') === '' ? null : $body['category'],
            'author' => ($body['author'] ?? '') === '' ? null : $body['author'],
            'is_featured' => (bool) ($body['featured'] ?? false),
        ];
        foreach (self::FIELDS as $prefix => $field) {
            foreach (config('locales.supported') as $locale) {
                $key = $locale === 'en' ? $prefix : $prefix.Str::ucfirst($locale);
                $input[$field][$locale] = is_string($body[$key] ?? null) ? $body[$key] : null;
            }
        }

        $validator = Validator::make($input, BlogPostInput::rules(), [], BlogPostInput::NAMES);
        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid blog post', 'issues' => $validator->errors()->toArray()], 400);
        }

        $post = BlogPost::create(BlogPostInput::clean($validator->validated()) + [
            'published_at' => ($body['published'] ?? true) ? now() : null,
        ]);
        $site = rtrim(trim(explode(',', (string) config('services.frontend.url'))[0]), '/');

        return response()->json(['id' => $post->id, 'slug' => $post->slug, 'url' => "{$site}/blog/{$post->slug}"], 201);
    }
}
