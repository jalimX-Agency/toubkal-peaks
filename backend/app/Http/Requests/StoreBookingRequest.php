<?php

namespace App\Http\Requests;

use App\Models\Tour;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // (the hidden "website" honeypot field is deliberately not validated: the controller answers bots silently)
            'tour_id' => ['nullable', 'integer', Rule::exists('tours', 'id')->where('status', 'published')->whereNull('deleted_at')],
            'locale' => ['nullable', Rule::in(config('locales.supported'))],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'country' => ['nullable', 'string', 'max:80'],
            'start_date' => ['nullable', 'date', 'after_or_equal:today'],
            'adults' => ['required', 'integer', 'min:1', 'max:30'],
            'children' => ['nullable', 'integer', 'min:0', 'max:30'],
            'special_requests' => ['nullable', 'string', 'max:2000'],
            'consent' => ['accepted'],
            'conditions_accepted' => ['sometimes', 'boolean'],
        ];
    }

    /** A Mount Toubkal trip needs the trekking conditions accepted: checked here too, not only in the browser. */
    public function after(): array
    {
        return [function (Validator $validator) {
            $tourId = $this->input('tour_id');
            if (! $tourId || $validator->errors()->has('tour_id')) {
                return;
            }
            $tour = Tour::with('category')->find($tourId);
            if ($tour?->requiresTrekkingConditions() && ! $this->boolean('conditions_accepted')) {
                $validator->errors()->add('conditions_accepted', 'Please accept the trekking conditions of this trip.');
            }
        }];
    }
}
