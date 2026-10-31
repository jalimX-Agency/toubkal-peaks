{{-- Label / value rows in a light box. $rows: [label => value], empty values skipped. --}}
@props(['rows'])
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; border:1px solid #e3dccf; border-radius:6px; background:#fbf8f3;">
    @foreach (array_filter($rows, fn ($v) => $v !== null && $v !== '') as $label => $value)
        <tr class="stack">
            <td width="38%" style="padding:11px 16px; {{ ! $loop->last ? 'border-bottom:1px solid #e3dccf;' : '' }} font-family:'Courier New', monospace; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:#bc7625; vertical-align:top;">{{ $label }}</td>
            <td style="padding:11px 16px; {{ ! $loop->last ? 'border-bottom:1px solid #e3dccf;' : '' }} font-size:15px; color:#16263b; vertical-align:top;">{!! nl2br(e($value)) !!}</td>
        </tr>
    @endforeach
</table>
