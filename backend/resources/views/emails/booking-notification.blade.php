<!doctype html>
<html lang="en">
<body style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1a1a1a; line-height: 1.5;">
    <h2>New booking request {{ $booking->reference }}</h2>
    <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Trip</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->tour_title ?: 'Custom trip' }}</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Customer</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->first_name }} {{ $booking->last_name }} ({{ $booking->country ?: 'country n/a' }})</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Email</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->email }}</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Phone</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->phone ?: 'n/a' }}</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Start date</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->start_date?->format('j F Y') ?: 'flexible' }}</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Travellers</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->adults }} adult(s), {{ $booking->children }} child(ren)</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Estimate</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ $booking->total_price !== null ? number_format((float) $booking->total_price, 2).' '.$booking->currency : 'on request' }}</td></tr>
        <tr><td style="padding: 6px; border-bottom: 1px solid #eee;"><strong>Language</strong></td><td style="padding: 6px; border-bottom: 1px solid #eee;">{{ strtoupper($booking->locale) }}</td></tr>
    </table>
    @if ($booking->special_requests)
        <h3>Special requests</h3>
        <p style="white-space: pre-line;">{{ $booking->special_requests }}</p>
    @endif
    <p style="color: #666;">Reply to this email to answer the customer directly.</p>
</body>
</html>
