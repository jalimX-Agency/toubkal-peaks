<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlogPostController extends Controller
{
    /** Published articles, newest first. Query: locale, category, page, per_page (max 100). */
    public function index(Request $request): JsonResponse
    {
        $locale = Locales::fromRequest($request);
        $query = BlogPost::published();
        if (in_array($request->query('category'), BlogPost::CATEGORIES, true)) {
            $query->where('category', $request->query('category'));
        }
        $page = $query->paginate(min(100, max(1, (int) $request->query('per_page', 12))));

        return response()->json([
            'data' => collect($page->items())->map(fn (BlogPost $p) => $p->toCardArray($locale))->values(),
            'meta' => ['current_page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'per_page' => $page->perPage(), 'total' => $page->total()],
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $post = BlogPost::published()->where('slug', $slug)->first();
        if (! $post) {
            return response()->json(['message' => 'Article not found.'], 404);
        }

        return response()->json(['data' => $post->toPublicArray(Locales::fromRequest($request))]);
    }
}
