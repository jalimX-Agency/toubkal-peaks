<!doctype html>
<html lang="en">
<body style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
    <h1 style="color: #b07d1e; font-weight: normal;">Thank you, {{ $booking->first_name }}</h1>
    <p>We have received your request. One of our team will reply within 24 hours to confirm the details and availability.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Reference</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $booking->reference }}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Trip</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $booking->tour_title ?: 'Custom trip' }}</td></tr>
        @if ($booking->start_date)
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Start date</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $booking->start_date->format('j F Y') }}</td></tr>
        @endif
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Travellers</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{{ $booking->adults }} adult(s)@if ($booking->children), {{ $booking->children }} child(ren)@endif</td></tr>
        <tr>
            <td style="padding: 8px;"><strong>Estimated price</strong></td>
            <td style="padding: 8px;">
                @if ($booking->total_price !== null)
                    {{ number_format((float) $booking->total_price, 2) }} {{ $booking->currency }}
                    ({{ number_format((float) $booking->price_per_person, 2) }} per person, to be confirmed)
                @else
                    We will send you a personal quote.
                @endif
            </td>
        </tr>
    </table>

    <p>Nothing is charged at this stage. If you have questions, just reply to this email.</p>
    <p style="color: #b07d1e;">The Toubkal Peaks team</p>
</body>
</html>
