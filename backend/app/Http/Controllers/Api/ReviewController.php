<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /** Published reviews from every source. Query: tour (id), featured=1, per_page (1-50, default 12). */
    public function index(Request $request)
    {
        $query = Review::published()->latest('reviewed_at')->latest('id');

        if ($tour = $request->query('tour')) {
            $query->where('tour_id', (int) $tour);
        }
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        $perPage = min(max((int) $request->query('per_page', 12), 1), 50);

        return ReviewResource::collection($query->paginate($perPage)->withQueryString())
            ->additional(['summary' => Review::summary($tour ? (int) $tour : null)]);
    }
}
