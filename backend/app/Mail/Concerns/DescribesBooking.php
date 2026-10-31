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

    /** This customer's deposit, written in their language; null when none was set (or 0). */
    protected function deposit(): ?string
    {
        $amount = (float) $this->booking->deposit_amount;

        return $amount > 0 ? Money::format($amount, $this->booking->currency ?: 'EUR', $this->booking->locale ?: 'en') : null;
    }

    /** PayPal.me link, with this customer's deposit filled in when there is one. */
    protected function depositUrl(): string
    {
        $base = rtrim((string) config('services.payments.paypal_url'), '/');
        $amount = (float) $this->booking->deposit_amount;

        return $amount > 0 ? $base.'/'.rtrim(rtrim(number_format($amount, 2, '.', ''), '0'), '.').($this->booking->currency ?: 'EUR') : $base;
    }
}
