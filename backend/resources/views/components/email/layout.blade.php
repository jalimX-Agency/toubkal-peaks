{{--
    Branded email frame (Toubkal Peaks): navy band with the logo, white card on cream, gold accents,
    contact details and company registration at the bottom. Tables and inline styles only, so it
    renders the same in Gmail, Outlook and Apple Mail; works in dark mode clients that keep colours.
    Variables: $title (h1), $preheader (inbox preview line), $eyebrow (optional), $lang (html lang).
--}}
@php
    $c = ['navy' => '#022e55', 'deep' => '#011d38', 'gold' => '#bc7625', 'goldLight' => '#d9a04f', 'cream' => '#fbf8f3', 'sand' => '#f2e8da', 'ink' => '#16263b', 'muted' => '#5b6779', 'line' => '#e3dccf'];
    $site = rtrim(trim(explode(',', (string) config('services.frontend.url'))[0]), '/') ?: 'https://toubkal-peaks.com';
@endphp
<!doctype html>
<html lang="{{ $lang ?? 'en' }}" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="color-scheme" content="light">
    <title>{{ $title }}</title>
    <style>
        @media (max-width: 620px) {
            .card { padding: 28px 20px !important; }
            .h1 { font-size: 24px !important; }
            .stack td { display: block !important; width: 100% !important; }
        }
        a { color: {{ $c['gold'] }}; }
    </style>
</head>
<body style="margin:0; padding:0; background:{{ $c['cream'] }}; -webkit-text-size-adjust:100%;">
    {{-- inbox preview text --}}
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; color:{{ $c['cream'] }};">{{ $preheader ?? '' }}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{{ $c['cream'] }};">
        <tr>
            <td align="center" style="padding:24px 12px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
                    {{-- header --}}
                    <tr>
                        <td style="background:{{ $c['navy'] }}; background-image:linear-gradient(135deg, {{ $c['navy'] }}, {{ $c['deep'] }}); border-radius:6px 6px 0 0; padding:26px 32px;">
                            <a href="{{ $site }}" style="text-decoration:none;">
                                <img src="https://cdn.toubkal-peaks.com/site/brand/logo-horizontal-on-dark.png" width="186" height="40" alt="Toubkal Peaks Travel" style="display:block; border:0; height:auto; max-width:186px; color:#ffffff; font-family:Georgia, serif; font-size:20px;">
                            </a>
                        </td>
                    </tr>
                    <tr><td style="height:4px; background:{{ $c['gold'] }}; font-size:0; line-height:0;">&nbsp;</td></tr>

                    {{-- content --}}
                    <tr>
                        <td class="card" style="background:#ffffff; padding:36px 36px 32px; font-family:Helvetica, Arial, sans-serif; font-size:16px; line-height:1.6; color:{{ $c['ink'] }};">
                            @isset($eyebrow)
                                <p style="margin:0 0 8px; font-family:'Courier New', monospace; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:{{ $c['gold'] }};">{{ $eyebrow }}</p>
                            @endisset
                            <h1 class="h1" style="margin:0 0 18px; font-family:Georgia, 'Times New Roman', serif; font-size:28px; line-height:1.25; font-weight:normal; letter-spacing:0.5px; color:{{ $c['navy'] }};">{{ $title }}</h1>
                            {{ $slot }}
                        </td>
                    </tr>

                    {{-- footer --}}
                    <tr>
                        <td style="background:{{ $c['sand'] }}; border-radius:0 0 6px 6px; padding:24px 36px; font-family:Helvetica, Arial, sans-serif; font-size:13px; line-height:1.6; color:{{ $c['muted'] }};">
                            <p style="margin:0 0 6px; font-family:Georgia, serif; font-size:15px; color:{{ $c['navy'] }};">Toubkal Peaks Travel</p>
                            <p style="margin:0;">
                                <a href="mailto:info@toubkal-peaks.com" style="color:{{ $c['navy'] }}; text-decoration:none;">info@toubkal-peaks.com</a>
                                &nbsp;·&nbsp; <a href="https://wa.me/212661283086" style="color:{{ $c['navy'] }}; text-decoration:none;">WhatsApp +212 661 283 086</a>
                                &nbsp;·&nbsp; <a href="{{ $site }}" style="color:{{ $c['navy'] }}; text-decoration:none;">{{ preg_replace('#^https?://#', '', $site) }}</a>
                            </p>
                            <p style="margin:8px 0 0; font-size:11px; color:{{ $c['muted'] }};">Dr Aremd, Commune Asni, El Haouz, 42150 Marrakech, Morocco · RC 52029 · IF 40494420 · ICE 000114960000080</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
