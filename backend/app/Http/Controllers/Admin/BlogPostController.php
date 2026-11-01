<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Support\BlogPostInput;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Blog articles: drafts and published ones, texts in every language, cover photo. */
class BlogPostController extends Controller
{
    public function index(): JsonResponse
    {
        $posts = BlogPost::orderByRaw('published_at is null desc')->orderByDesc('published_at')->orderByDesc('id')->get();

        return response()->json([
            'data' => $posts->map(fn (BlogPost $p) => $this->present($p, withContent: false))->values(),
            'categories' => BlogPost::CATEGORIES,
        ]);
    }

    public function show(BlogPost $post): JsonResponse
    {
        return response()->json(['data' => $this->present($post), 'categories' => BlogPost::CATEGORIES]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = BlogPostInput::clean($request->validate(BlogPostInput::rules(), [], BlogPostInput::NAMES));
        $post = BlogPost::create($data);

        return response()->json(['data' => $this->present($post)], 201);
    }

    public function update(Request $request, BlogPost $post): JsonResponse
    {
        $post->update(BlogPostInput::clean($request->validate(BlogPostInput::rules($post, partial: true), [], BlogPostInput::NAMES)));

        return response()->json(['data' => $this->present($post->fresh())]);
    }

    public function destroy(BlogPost $post): JsonResponse
    {
        $post->delete();

        return response()->json(['message' => 'Article deleted.']);
    }

    /** New cover photo (JPEG, PNG or WebP, under 3 MB: the website's upload limit), stored on the media disk. */
    public function cover(Request $request, BlogPost $post): JsonResponse
    {
        $request->validate(['photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2900', 'dimensions:min_width=1000']]);
        $file = $request->file('photo');
        $disk = Storage::disk(config('filesystems.media_disk'));
        $path = 'site/blog/'.$post->slug.'-'.Str::lower(Str::random(6)).'.'.$file->extension();
        $disk->put($path, file_get_contents($file->getRealPath()));
        $post->update(['image_url' => $disk->url($path)]);

        return response()->json(['data' => $this->present($post->fresh())]);
    }

    private function present(BlogPost $p, bool $withContent = true): array
    {
        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'title' => (object) ($p->title ?? []),
            'excerpt' => (object) ($p->excerpt ?? []),
            'image_url' => $p->image_url,
            'image_alt' => (object) ($p->image_alt ?? []),
            'category' => $p->category,
            'author' => $p->author,
            'is_featured' => $p->is_featured,
            'published_at' => $p->published_at?->toIso8601String(),
            'locales' => $p->locales(),
            'updated_at' => $p->updated_at?->toIso8601String(),
        ] + ($withContent ? ['content' => (object) ($p->content ?? [])] : []);
    }
}
