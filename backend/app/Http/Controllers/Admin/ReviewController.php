<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReviewSource;
use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Customer reviews: approve or hide what the website shows, and add reviews from other platforms. */
class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::enum(ReviewStatus::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $page = Review::with('tour.translations')
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['q'] ?? null, function ($q, $term) {
                $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $term).'%';
                $q->where(fn ($w) => $w->where('author_name', 'like', $like)->orWhere('title', 'like', $like)->orWhere('body', 'like', $like));
            })
            ->orderByRaw("status = 'pending' desc")->latest('reviewed_at')->latest('id')
            ->paginate(30);
        $counts = Review::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return response()->json([
            'data' => $page->getCollection()->map(fn (Review $r) => $this->present($r))->all(),
            'meta' => ['total' => $page->total(), 'current_page' => $page->currentPage(), 'last_page' => $page->lastPage()],
            'counts' => collect(ReviewStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $review = Review::create($this->validated($request) + ['status' => $request->input('status', ReviewStatus::Published->value)]);

        return response()->json(['data' => $this->present($review)], 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $review->update($this->validated($request, partial: true));

        return response()->json(['data' => $this->present($review->fresh())]);
    }

    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $req = $partial ? ['sometimes', 'required'] : ['required'];

        return $request->validate([
            'source' => [...$req, Rule::enum(ReviewSource::class)],
            'author_name' => [...$req, 'string', 'max:120'],
            'author_country' => ['sometimes', 'nullable', 'string', 'max:80'],
            'rating' => [...$req, 'integer', 'min:1', 'max:5'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'body' => [...$req, 'string', 'max:10000'],
            'language' => ['sometimes', 'nullable', Rule::in(['en', 'fr', 'es', 'de', 'it', 'nl', 'ar'])],
            'reviewed_at' => ['sometimes', 'nullable', 'date', 'before_or_equal:today'],
            'url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'tour_id' => ['sometimes', 'nullable', 'integer', 'exists:tours,id'],
            'status' => ['sometimes', Rule::enum(ReviewStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
        ]);
    }

    private function present(Review $r): array
    {
        return [
            'id' => $r->id,
            'source' => $r->source->value,
            'author_name' => $r->author_name,
            'author_country' => $r->author_country,
            'rating' => $r->rating,
            'title' => $r->title,
            'body' => $r->body,
            'language' => $r->language,
            'reviewed_at' => $r->reviewed_at?->toDateString(),
            'url' => $r->url,
            'tour_id' => $r->tour_id,
            'tour_title' => $r->tour?->translate('en')?->title,
            'status' => $r->status->value,
            'is_featured' => $r->is_featured,
            'created_at' => $r->created_at?->toIso8601String(),
        ];
    }
}
