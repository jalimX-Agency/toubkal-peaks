<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Enums\ReviewStatus;
use App\Enums\TourStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Tour;
use App\Models\TourTranslation;
use Illuminate\Http\JsonResponse;

/** The admin home: what needs attention now and how the month is going. */
class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $monthStart = now()->startOfMonth();
        $won = [BookingStatus::Confirmed->value, BookingStatus::Paid->value, BookingStatus::Completed->value];

        $upcoming = Booking::whereIn('status', [BookingStatus::Confirmed->value, BookingStatus::Paid->value])
            ->whereBetween('start_date', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->orderBy('start_date')->limit(8)->get();

        return response()->json([
            'stats' => [
                'pending_bookings' => Booking::where('status', BookingStatus::Pending->value)->count(),
                'new_this_week' => Booking::where('created_at', '>=', now()->subDays(7))->count(),
                'confirmed_this_month' => Booking::whereIn('status', $won)->where('confirmed_at', '>=', $monthStart)->count(),
                'revenue_this_month' => (float) Booking::whereIn('status', $won)->where('confirmed_at', '>=', $monthStart)->sum('total_price'),
                'pending_reviews' => Review::where('status', ReviewStatus::Pending->value)->count(),
                'published_tours' => Tour::where('status', TourStatus::Published->value)->count(),
                'prices_to_check' => Tour::whereNull('price_reviewed_at')->where('price_mode', 'tiers')->count(),
                'translations_to_review' => TourTranslation::where('translation_status', 'machine')->count(),
            ],
            'recent' => Booking::latest('id')->limit(6)->get()->map(fn (Booking $b) => $this->row($b))->all(),
            'upcoming' => $upcoming->map(fn (Booking $b) => $this->row($b))->all(),
        ]);
    }

    private function row(Booking $b): array
    {
        return [
            'reference' => $b->reference,
            'status' => $b->status->value,
            'name' => trim("{$b->first_name} {$b->last_name}"),
            'tour_title' => $b->tour_title,
            'start_date' => $b->start_date?->toDateString(),
            'guests' => $b->guests(),
            'total_price' => $b->total_price === null ? null : (float) $b->total_price,
            'currency' => $b->currency,
            'created_at' => $b->created_at?->toIso8601String(),
        ];
    }
}
