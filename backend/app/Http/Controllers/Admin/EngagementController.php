<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\SiteEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * What visitors do on the website, for the dashboard: visits, clicks on WhatsApp / phone / email (counted by the
 * website) and booking requests (the bookings table, spam that was cancelled left out).
 */
class EngagementController extends Controller
{
    private const CONTACTS = ['whatsapp', 'phone', 'email'];

    public function __invoke(Request $request): JsonResponse
    {
        $days = (int) ($request->validate(['days' => ['nullable', 'integer', 'in:7,30,90']])['days'] ?? 30);
        $from = now()->subDays($days - 1)->startOfDay();

        $events = SiteEvent::where('created_at', '>=', $from);
        $requests = Booking::where('created_at', '>=', $from)->where('status', '!=', BookingStatus::Cancelled->value);

        $count = fn ($query, string $event) => (clone $query)->where('event', $event)->count();
        $totals = [
            'visits' => $count($events, 'visit'),
            'whatsapp' => $count($events, 'whatsapp'),
            'phone' => $count($events, 'phone'),
            'email' => $count($events, 'email'),
            'requests' => (clone $requests)->count(),
        ];

        // day by day (days without anything included, so the chart has no holes)
        $perDay = (clone $events)->selectRaw('date(created_at) as d, event, count(*) as n')->groupBy('d', 'event')->get()->groupBy('d');
        $requestsPerDay = (clone $requests)->selectRaw('date(created_at) as d, count(*) as n')->groupBy('d')->pluck('n', 'd');
        $daily = collect(range(0, $days - 1))->map(function (int $i) use ($from, $perDay, $requestsPerDay) {
            $date = $from->copy()->addDays($i)->toDateString();
            $rows = ($perDay[$date] ?? collect())->pluck('n', 'event');

            return [
                'date' => $date,
                'visits' => (int) ($rows['visit'] ?? 0),
                'whatsapp' => (int) ($rows['whatsapp'] ?? 0),
                'phone' => (int) ($rows['phone'] ?? 0),
                'email' => (int) ($rows['email'] ?? 0),
                'requests' => (int) ($requestsPerDay[$date] ?? 0),
            ];
        })->all();

        // by where the visitor came from
        $byChannel = (clone $events)->selectRaw("coalesce(channel, 'direct') as k, event, count(*) as n")->groupBy('k', 'event')->get()->groupBy('k');
        $requestsByChannel = (clone $requests)->selectRaw("coalesce(channel, 'unknown') as k, count(*) as n")->groupBy('k')->pluck('n', 'k');
        $channels = collect(array_values(array_unique([...$byChannel->keys()->all(), ...$requestsByChannel->keys()->all()])))->map(function (string $k) use ($byChannel, $requestsByChannel) {
            $rows = ($byChannel[$k] ?? collect())->pluck('n', 'event');

            return [
                'channel' => $k,
                'visits' => (int) ($rows['visit'] ?? 0),
                'whatsapp' => (int) ($rows['whatsapp'] ?? 0),
                'phone' => (int) ($rows['phone'] ?? 0),
                'email' => (int) ($rows['email'] ?? 0),
                'requests' => (int) ($requestsByChannel[$k] ?? 0),
            ];
        })->sortByDesc(fn ($c) => $c['visits'] + $c['whatsapp'] + $c['phone'] + $c['email'] + $c['requests'])->values()->all();

        $contacts = fn () => (clone $events)->whereIn('event', self::CONTACTS);
        $pages = $contacts()->selectRaw('page, event, count(*) as n')->groupBy('page', 'event')->get()->groupBy('page')->map(function ($rows, $page) {
            $by = $rows->pluck('n', 'event');

            return ['page' => $page, 'whatsapp' => (int) ($by['whatsapp'] ?? 0), 'phone' => (int) ($by['phone'] ?? 0), 'email' => (int) ($by['email'] ?? 0), 'total' => (int) $rows->sum('n')];
        })->sortByDesc('total')->take(8)->values()->all();

        $trips = $contacts()->whereNotNull('tour_slug')->selectRaw('tour_slug, count(*) as n')->groupBy('tour_slug')->orderByDesc('n')->limit(6)->get()
            ->map(fn ($r) => ['slug' => $r->tour_slug, 'contacts' => (int) $r->n])->all();

        $devices = (clone $events)->where('event', 'visit')->selectRaw("coalesce(device, 'unknown') as k, count(*) as n")->groupBy('k')->orderByDesc('n')->get()
            ->map(fn ($r) => ['device' => $r->k, 'visits' => (int) $r->n])->all();

        $countries = (clone $events)->whereNotNull('country')->selectRaw('country, event, count(*) as n')->groupBy('country', 'event')->get()->groupBy('country')->map(function ($rows, $country) {
            $by = $rows->pluck('n', 'event');

            return ['country' => $country, 'visits' => (int) ($by['visit'] ?? 0), 'contacts' => (int) collect(self::CONTACTS)->sum(fn ($e) => $by[$e] ?? 0)];
        })->sortByDesc('visits')->take(8)->values()->all();

        $first = SiteEvent::min('created_at');

        return response()->json(['data' => [
            'days' => $days,
            'totals' => $totals,
            'daily' => $daily,
            'channels' => $channels,
            'pages' => $pages,
            'trips' => $trips,
            'devices' => $devices,
            'countries' => $countries,
            'tracking_since' => $first ? Carbon::parse($first)->toDateString() : null,
        ]]);
    }
}
