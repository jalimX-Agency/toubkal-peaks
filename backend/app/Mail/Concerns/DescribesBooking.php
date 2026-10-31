<?php

namespace App\Mail\Concerns;

use App\Support\Money;

/** What the customer emails share: the booking summary in the booking's language, and the deposit. */
trait DescribesBooking
{
    /** @return array<string, string|null> label => value, in the mail's language */
    protected function bookingRows(): array
    {
        $b = $this->booking;
        $locale = $b->locale ?: 'en';
        $travellers = trans_choice('emails.adults', $b->adults, [], $locale)
            .($b->children ? ', '.trans_choice('emails.children', $b->children, [], $locale) : '');
        $estimate = $b->total_price !== null
            ? __('emails.estimate_value', ['total' => Money::format($b->total_price, $b->currency, $locale), 'per' => Money::format($b->price_per_person, $b->currency, $locale)], $locale)
            : __('emails.quote', [], $locale);

        return [
            __('emails.labels.reference', [], $locale) => $b->reference,
            __('emails.labels.trip', [], $locale) => $b->tour_title ?: __('emails.custom_trip', [], $locale),
            __('emails.labels.date', [], $locale) => $b->start_date ? $b->start_date->locale($locale)->translatedFormat('j F Y') : __('emails.no_date', [], $locale),
            __('emails.labels.travellers', [], $locale) => $travellers,
            __('emails.labels.estimate', [], $locale) => $estimate,
        ];
    }

    protected function deposit(): string
    {
        return Money::format(config('services.payments.deposit'), config('services.payments.deposit_currency'), $this->booking->locale ?: 'en');
    }

    /** PayPal.me link with the deposit amount filled in. */
    protected function depositUrl(): string
    {
        return rtrim((string) config('services.payments.paypal_url'), '/').'/'.config('services.payments.deposit').config('services.payments.deposit_currency');
    }
}
