<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TourCardResource;
use App\Http\Resources\TourDetailResource;
use App\Models\Tour;
use App\Models\TourTranslation;
use App\Support\Locales;
use Illuminate\Http\Request;

class TourController extends Controller
{
    private const CARD_RELATIONS = ['translations', 'category.translations', 'category.parent.translations', 'hero', 'prices'];

    /**
     * Published tours as cards.
     * Query: locale, category (key such as "treks" or "treks.toubkal"; a parent includes its children),
     * featured=1, per_page (1-60, default 24).
     */
    public function index(Request $request)
    {
        $query = Tour::published()->with(self::CARD_RELATIONS)->orderBy('sort_order')->orderBy('id');

        if ($key = $request->query('category')) {
            $query->whereHas('category', fn ($c) => $c->where('key', $key)->orWhereHas('parent', fn ($p) => $p->where('key', $key)));
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        $perPage = min(max((int) $request->query('per_page', 24), 1), 60);

        return TourCardResource::collection($query->paginate($perPage)->withQueryString());
    }

    /** One published tour by its URL slug. Falls back to the English content when the locale is not translated yet. */
    public function show(Request $request, string $slug)
    {
        $locale = Locales::fromRequest($request);

        $translation = TourTranslation::where('slug', $slug)
            ->whereIn('locale', [$locale, config('locales.fallback')])
            ->orderByRaw('locale = ? desc', [$locale])
            ->first();

        $tour = $translation
            ? Tour::published()->with([...self::CARD_RELATIONS, 'media'])->find($translation->tour_id)
            : null;

        abort_if($tour === null, 404, 'Tour not found.');

        return new TourDetailResource($tour);
    }
}
