{{-- Gold call-to-action button (bulletproof: a padded table cell, so Outlook keeps its shape). --}}
@props(['href', 'outline' => false])
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
        <td style="border-radius:4px; {{ $outline ? 'border:2px solid #022e55;' : 'background:#bc7625;' }}">
            <a href="{{ $href }}" target="_blank" style="display:inline-block; padding:14px 28px; font-family:Helvetica, Arial, sans-serif; font-size:16px; font-weight:bold; text-decoration:none; border-radius:4px; color:{{ $outline ? '#022e55' : '#ffffff' }};">{{ $slot }}</a>
        </td>
    </tr>
</table>
