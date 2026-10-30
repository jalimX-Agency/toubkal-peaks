<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PriceMode;
use App\Enums\TourStatus;
use App\Http\Controllers\Controller;
use App\Models\Redirect;
use App\Models\Tour;
use App\Models\TourPrice;
use App\Models\TourTranslation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Trips for the team: settings, content in every language, and per-person price tiers. */
class TourController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(TourStatus::class)],
            'category' => ['nullable', 'string', 'max:80'],
        ]);

        $tours = Tour::with(['translations:id,tour_id,locale,title,slug,translation_status,updated_at', 'category:id,key', 'prices', 'hero'])
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['category'] ?? null, fn ($q, $c) => $q->whereHas('category', fn ($w) => $w->where('key', $c)->orWhere('key', 'like', "{$c}.%")))
            ->when($data['q'] ?? null, fn ($q, $term) => $q->whereHas('translations', fn ($w) => $w->where('title', 'like', '%'.str_replace(['%', '_'], ['\%', '\_'], $term).'%')))
            ->orderBy('sort_order')->orderBy('id')
            ->get();

        return response()->json(['data' => $tours->map(fn (Tour $t) => [
            'id' => $t->id,
            'title' => $t->translate('en')?->title,
            'category' => $t->category?->key,
            'status' => $t->status->value,
            'duration_days' => $t->duration_days,
            'price_mode' => $t->price_mode->value,
            'from_price' => $t->fromPrice(),
            'currency' => $t->currency,
            'price_reviewed' => $t->price_reviewed_at !== null,
            'is_featured' => $t->is_featured,
            'translations' => collect(config('locales.supported'))->mapWithKeys(fn ($l) => [$l => $t->translations->firstWhere('locale', $l)?->translation_status]),
            'hero' => $t->hero?->url(),
            'updated_at' => $t->updated_at?->toIso8601String(),
        ])->all()]);
    }

    public function show(Tour $tour): JsonResponse
    {
        return response()->json(['data' => $this->detail($tour)]);
    }

    /** Trip settings shared by every language. */
    public function update(Request $request, Tour $tour): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(TourStatus::class)],
            'duration_days' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:60'],
            'duration_nights' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:60'],
            'difficulty' => ['sometimes', 'nullable', Rule::in(['easy', 'moderate', 'challenging', 'difficult'])],
            'max_altitude_m' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:9000'],
            'group_min' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:60'],
            'group_max' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:60', 'gte:group_min'],
            'price_mode' => ['sometimes', Rule::enum(PriceMode::class)],
            'currency' => ['sometimes', Rule::in(['EUR', 'USD', 'GBP', 'MAD'])],
            'is_featured' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:65000'],
        ]);

        if (($data['status'] ?? null) === TourStatus::Published->value && $tour->published_at === null) {
            $data['published_at'] = now();
        }
        $tour->update($data);

        return response()->json(['data' => $this->detail($tour->fresh())]);
    }

    /** Save the content of one language. A person's edit marks a translation as reviewed. */
    public function translation(Request $request, Tour $tour, string $locale): JsonResponse
    {
        abort_unless(in_array($locale, config('locales.supported'), true), 404);
        $isSource = $locale === config('locales.fallback');
        $existing = $tour->translations()->where('locale', $locale)->first();

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('tour_translations')->where('locale', $locale)->ignore($existing?->id)],
            'summary' => ['nullable', 'string', 'max:5000'],
            'highlights' => ['nullable', 'array', 'max:40'], 'highlights.*' => ['string', 'max:500'],
            'facts' => ['nullable', 'array', 'max:40'], 'facts.*' => ['nullable', 'string', 'max:500'],
            'itinerary' => ['nullable', 'array', 'max:60'],
            'itinerary.*.day' => ['required', 'integer', 'min:1', 'max:60'],
            'itinerary.*.title' => ['required', 'string', 'max:255'],
            'itinerary.*.stats' => ['nullable', 'array'], 'itinerary.*.stats.*' => ['nullable', 'string', 'max:120'],
            'itinerary.*.accommodation' => ['nullable', 'string', 'max:255'],
            'itinerary.*.body' => ['nullable', 'array', 'max:60'], 'itinerary.*.body.*' => ['nullable', 'string', 'max:5000'],
            'included' => ['nullable', 'array', 'max:80'], 'included.*' => ['nullable', 'string', 'max:1000'],
            'excluded' => ['nullable', 'array', 'max:80'], 'excluded.*' => ['nullable', 'string', 'max:1000'],
            'upgrades' => ['nullable', 'array', 'max:40'], 'upgrades.*' => ['nullable', 'string', 'max:2000'],
            'packing' => ['nullable', 'array', 'max:20'],
            'packing.*.group' => ['required', 'string', 'max:120'],
            'packing.*.items' => ['array', 'max:100'], 'packing.*.items.*' => ['nullable', 'string', 'max:300'],
            'seo_title' => ['nullable', 'string', 'max:160'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'translation_status' => ['nullable', Rule::in(['machine', 'reviewed'])],
        ], ['slug.regex' => 'Use lowercase letters, numbers and hyphens only.']);

        DB::transaction(function () use ($tour, $locale, $data, $existing, $isSource) {
            if ($existing && $existing->slug !== $data['slug']) {
                $this->redirectOldPath($tour, $locale, $existing->slug, $data['slug']);
            }
            TourTranslation::updateOrCreate(['tour_id' => $tour->id, 'locale' => $locale], [
                ...$data,
                'translation_status' => $isSource ? 'source' : ($data['translation_status'] ?? 'reviewed'),
            ]);
            $tour->touch();
        });

        return response()->json(['data' => $this->detail($tour->fresh())]);
    }

    /** Replace the price tiers (people from / to, price per person); saving marks prices as checked. */
    public function prices(Request $request, Tour $tour): JsonResponse
    {
        $data = $request->validate([
            'tiers' => ['present', 'array', 'max:20'],
            'tiers.*.min_pax' => ['required', 'integer', 'min:1', 'max:60'],
            'tiers.*.max_pax' => ['nullable', 'integer', 'min:1', 'max:60', 'gte:tiers.*.min_pax'],
            'tiers.*.price_per_person' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ]);

        DB::transaction(function () use ($tour, $data) {
            $tour->prices()->delete();
            foreach (collect($data['tiers'])->sortBy('min_pax') as $tier) {
                $tour->prices()->create($tier);
            }
            $tour->update(['price_reviewed_at' => now()]);
        });

        return response()->json(['data' => $this->detail($tour->fresh())]);
    }

    /** Old links keep working after a slug change (the website reads the redirects table). */
    private function redirectOldPath(Tour $tour, string $locale, string $old, string $new): void
    {
        $prefix = $locale === config('locales.fallback') ? '' : "/{$locale}";
        $category = trim((string) $tour->category?->path($locale), '/');
        $base = $prefix.($category === '' ? '' : "/{$category}");
        Redirect::updateOrCreate(['from_path' => "{$base}/{$old}/"], [
            'to_path' => "{$base}/{$new}",
            'status_code' => 301,
            'is_active' => true,
            'notes' => 'Slug changed in the admin',
        ]);
    }

    private function detail(Tour $tour): array
    {
        $tour->loadMissing(['translations', 'prices', 'category', 'hero']);
        $fields = ['slug', 'title', 'summary', 'highlights', 'facts', 'itinerary', 'included', 'excluded', 'packing', 'upgrades', 'seo_title', 'seo_description', 'translation_status'];

        return [
            'id' => $tour->id,
            'category' => $tour->category?->key,
            'status' => $tour->status->value,
            'duration_days' => $tour->duration_days,
            'duration_nights' => $tour->duration_nights,
            'difficulty' => $tour->difficulty,
            'max_altitude_m' => $tour->max_altitude_m,
            'group_min' => $tour->group_min,
            'group_max' => $tour->group_max,
            'price_mode' => $tour->price_mode->value,
            'currency' => $tour->currency,
            'is_featured' => $tour->is_featured,
            'sort_order' => $tour->sort_order,
            'price_reviewed_at' => $tour->price_reviewed_at?->toIso8601String(),
            'published_at' => $tour->published_at?->toIso8601String(),
            'hero' => $tour->hero?->url(),
            'images' => app(TourImageController::class)->images($tour),
            'paths' => collect(config('locales.supported'))->mapWithKeys(function ($l) use ($tour) {
                $t = $tour->translations->firstWhere('locale', $l);
                $category = trim((string) $tour->category?->path($l), '/');

                return [$l => $t ? ($l === config('locales.fallback') ? '' : "/{$l}").($category === '' ? '' : "/{$category}")."/{$t->slug}" : null];
            }),
            'prices' => $tour->prices->map(fn (TourPrice $p) => [
                'min_pax' => $p->min_pax,
                'max_pax' => $p->max_pax,
                'price_per_person' => $p->price_per_person === null ? null : (float) $p->price_per_person,
            ])->values()->all(),
            'translations' => collect(config('locales.supported'))->mapWithKeys(function ($l) use ($tour, $fields) {
                $t = $tour->translations->firstWhere('locale', $l);

                return [$l => $t ? collect($fields)->mapWithKeys(fn ($f) => [$f => $t->{$f}])->all() + ['updated_at' => $t->updated_at?->toIso8601String()] : null];
            }),
            'updated_at' => $tour->updated_at?->toIso8601String(),
        ];
    }
}
