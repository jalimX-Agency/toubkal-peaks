<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmed;
use App\Models\Booking;
use App\Models\BookingStatusLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

/** Reservation requests for the team: list, details, edits and the status workflow. */
class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', Rule::enum(BookingStatus::class)],
            'q' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'sort' => ['nullable', Rule::in(['newest', 'departure'])],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $query = Booking::query()
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['from'] ?? null, fn ($q, $d) => $q->whereDate('start_date', '>=', $d))
            ->when($data['to'] ?? null, fn ($q, $d) => $q->whereDate('start_date', '<=', $d))
            ->when($data['q'] ?? null, function ($q, $term) {
                $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $term).'%';
                $q->where(fn ($w) => $w->where('reference', 'like', $like)->orWhere('email', 'like', $like)
                    ->orWhere('first_name', 'like', $like)->orWhere('last_name', 'like', $like)
                    ->orWhere('phone', 'like', $like)->orWhere('tour_title', 'like', $like));
            });
        ($data['sort'] ?? 'newest') === 'departure'
            ? $query->orderByRaw('start_date is null')->orderBy('start_date')
            : $query->latest('id');

        $page = $query->paginate($data['per_page'] ?? 25);
        $counts = Booking::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return response()->json([
            'data' => $page->getCollection()->map(fn (Booking $b) => $this->summary($b))->all(),
            'meta' => ['total' => $page->total(), 'current_page' => $page->currentPage(), 'last_page' => $page->lastPage()],
            'counts' => collect(BookingStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)]),
        ]);
    }

    public function show(string $reference): JsonResponse
    {
        return response()->json(['data' => $this->detail($this->find($reference))]);
    }

    /** Edit what the team agrees with the customer (dates, party, prices, notes, contact details). */
    public function update(Request $request, string $reference): JsonResponse
    {
        $booking = $this->find($reference);
        $data = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:190'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'country' => ['sometimes', 'nullable', 'string', 'max:80'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'adults' => ['sometimes', 'required', 'integer', 'min:1', 'max:60'],
            'children' => ['sometimes', 'required', 'integer', 'min:0', 'max:60'],
            'price_per_person' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1000000'],
            'total_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1000000'],
            'deposit_amount' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:1000000'],
            'paid_amount' => ['sometimes', 'required', 'numeric', 'min:0', 'max:1000000'],
            'admin_notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ]);

        $booking->update($data);

        return response()->json(['data' => $this->detail($booking->fresh())]);
    }

    public function status(Request $request, string $reference): JsonResponse
    {
        $booking = $this->find($reference);
        $data = $request->validate([
            'status' => ['required', Rule::in(array_map(fn ($s) => $s->value, $booking->status->next()))],
            'note' => ['nullable', 'string', 'max:500'],
            // the deposit differs from one customer to another: asked when confirming (0 = no deposit)
            'deposit_amount' => [Rule::requiredIf($request->input('status') === BookingStatus::Confirmed->value), 'nullable', 'numeric', 'min:0', 'max:1000000'],
        ], ['status.in' => 'This status change is not allowed from '.$booking->status->value.'.', 'deposit_amount.required' => 'Enter the deposit for this customer (0 if none).']);

        if (array_key_exists('deposit_amount', $data) && $data['deposit_amount'] !== null) {
            $booking->update(['deposit_amount' => $data['deposit_amount']]);
        }

        $booking->transitionTo(BookingStatus::from($data['status']), $request->user()->id, $data['note'] ?? null);

        // trip available: the customer gets the PayPal deposit link (a mail failure never blocks the change)
        $mailed = null;
        if ($data['status'] === BookingStatus::Confirmed->value) {
            try {
                Mail::to($booking->email)->send(new BookingConfirmed($booking->fresh()));
                $mailed = true;
            } catch (\Throwable $e) {
                report($e);
                $mailed = false;
            }
        }

        return response()->json(['data' => $this->detail($booking->fresh()), 'customer_emailed' => $mailed]);
    }

    /** Removes a request from the lists (soft delete: it stays in the database, out of sight). */
    public function destroy(Request $request, string $reference): JsonResponse
    {
        $booking = $this->find($reference);
        $booking->forceFill(['admin_notes' => trim(($booking->admin_notes ?? '')."
[Deleted by {$request->user()->name} on ".now()->toDateString().']')])->save();
        $booking->delete();

        return response()->json(['message' => 'Booking deleted.']);
    }

    private function find(string $reference): Booking
    {
        return Booking::where('reference', $reference)->firstOrFail();
    }

    private function summary(Booking $b): array
    {
        return [
            'reference' => $b->reference,
            'status' => $b->status->value,
            'name' => trim("{$b->first_name} {$b->last_name}"),
            'email' => $b->email,
            'phone' => $b->phone,
            'country' => $b->country,
            'tour_title' => $b->tour_title,
            'start_date' => $b->start_date?->toDateString(),
            'adults' => $b->adults,
            'children' => $b->children,
            'total_price' => $b->total_price === null ? null : (float) $b->total_price,
            'currency' => $b->currency,
            'locale' => $b->locale,
            'source' => $b->source,
            'created_at' => $b->created_at?->toIso8601String(),
        ];
    }

    private function detail(Booking $b): array
    {
        $b->loadMissing(['statusLogs.user', 'tour.translations']);

        return $this->summary($b) + [
            'first_name' => $b->first_name,
            'last_name' => $b->last_name,
            'tour_id' => $b->tour_id,
            'tour_slug' => $b->tour?->translate('en')?->slug,
            'end_date' => $b->end_date?->toDateString(),
            'price_per_person' => $b->price_per_person === null ? null : (float) $b->price_per_person,
            'deposit_amount' => $b->deposit_amount === null ? null : (float) $b->deposit_amount,
            'paid_amount' => (float) $b->paid_amount,
            'balance_due' => $b->balanceDue(),
            'special_requests' => $b->special_requests,
            'admin_notes' => $b->admin_notes,
            'next_statuses' => array_map(fn ($s) => $s->value, $b->status->next()),
            'history' => $b->statusLogs->map(fn (BookingStatusLog $log) => [
                'from' => $log->from_status,
                'to' => $log->to_status,
                'note' => $log->note,
                'user' => $log->user?->name,
                'at' => $log->created_at?->toIso8601String(),
            ])->all(),
            'updated_at' => $b->updated_at?->toIso8601String(),
        ];
    }
}
