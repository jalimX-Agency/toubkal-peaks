@php
    $estimate = $booking->total_price !== null
        ? \App\Support\Money::format($booking->total_price, $booking->currency).' ('.\App\Support\Money::format($booking->price_per_person, $booking->currency).' per person)'
        : 'On request';
@endphp
<x-email.layout :title="'New request: '.($booking->tour_title ?: 'Tailor-made trip')" :preheader="$booking->first_name.' '.$booking->last_name.' · '.($booking->start_date?->format('j M Y') ?: 'dates open').' · '.($booking->adults + $booking->children).' travellers'" :eyebrow="'Booking '.$booking->reference">
    <p style="margin:0;">{{ $booking->first_name }} {{ $booking->last_name }} sent a booking request from the website ({{ strtoupper($booking->locale) }}). Reply within 24 hours; replying to this email writes to the customer.</p>

    <x-email.details :rows="[
        'Customer' => $booking->first_name.' '.$booking->last_name.($booking->country ? ' · '.$booking->country : ''),
        'Email' => $booking->email,
        'Phone' => $booking->phone,
        'Trip' => $booking->tour_title ?: 'Tailor-made trip',
        'Start date' => $booking->start_date?->format('l j F Y') ?: 'Not decided',
        'Travellers' => $booking->adults.' adult(s)'.($booking->children ? ', '.$booking->children.' child(ren)' : ''),
        'Estimate' => $estimate,
        'Language' => strtoupper($booking->locale),
    ]" />

    @if ($booking->special_requests)
        <p style="margin:0 0 6px; font-family:'Courier New', monospace; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#bc7625;">Wishes and details</p>
        <div style="padding:14px 16px; border-left:3px solid #bc7625; background:#fbf8f3; font-size:15px; white-space:pre-line;">{{ $booking->special_requests }}</div>
    @endif

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        <tr>
            @if ($adminUrl)
                <td style="padding-right:10px;"><x-email.button :href="$adminUrl">Open in the admin</x-email.button></td>
            @endif
            @if ($whatsapp)
                <td><x-email.button :href="$whatsapp" :outline="true">WhatsApp</x-email.button></td>
            @endif
        </tr>
    </table>
    <p style="margin:0; font-size:13px; color:#5b6779;">When the trip is available, set the request to “Confirmed” in the admin and enter this customer's deposit: they automatically receive the PayPal link with that amount.</p>
</x-email.layout>
