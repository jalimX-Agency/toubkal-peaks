<x-email.layout :title="__('emails.received.title', ['name' => $booking->first_name])" :preheader="__('emails.received.preheader')" :eyebrow="__('emails.received.eyebrow')" :lang="app()->getLocale()">
    <p style="margin:0 0 4px;">{{ __('emails.received.intro') }}</p>

    <x-email.details :rows="$rows" />

    <h2 style="margin:28px 0 12px; font-family:Georgia, serif; font-size:19px; font-weight:normal; color:#022e55;">{{ __('emails.received.next') }}</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        @foreach ([__('emails.received.step1'), __('emails.received.step2'), __('emails.received.step3')] as $i => $step)
            <tr>
                <td width="40" valign="top" style="padding:0 12px 14px 0;">
                    <div style="width:28px; height:28px; border-radius:14px; background:#022e55; color:#ffffff; font-family:Georgia, serif; font-size:14px; line-height:28px; text-align:center;">{{ $i + 1 }}</div>
                </td>
                <td valign="top" style="padding:3px 0 14px; font-size:15px; color:#16263b;">
                    {{ $step }}
                </td>
            </tr>
        @endforeach
    </table>

    <p style="margin:18px 0 0; font-size:15px; color:#5b6779;">{{ __('emails.questions') }}</p>
    <p style="margin:18px 0 0; font-family:Georgia, serif; font-size:16px; color:#bc7625;">{{ __('emails.team') }}</p>
</x-email.layout>
