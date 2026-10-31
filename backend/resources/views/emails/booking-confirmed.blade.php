<x-email.layout :title="__('emails.confirmed.title', ['name' => $booking->first_name])" :preheader="$deposit ? __('emails.confirmed.preheader', ['deposit' => $deposit]) : __('emails.confirmed.eyebrow')" :eyebrow="__('emails.confirmed.eyebrow')" :lang="app()->getLocale()">
    @if ($deposit)
        <p style="margin:0;">{{ __('emails.confirmed.intro', ['deposit' => $deposit]) }}</p>

        <x-email.button :href="$depositUrl">{{ __('emails.confirmed.button', ['deposit' => $deposit]) }}</x-email.button>

        <p style="margin:0; font-size:14px; color:#5b6779;">{{ __('emails.confirmed.note', ['reference' => $booking->reference]) }}</p>
    @else
        <p style="margin:0;">{{ __('emails.confirmed.intro_no_deposit') }}</p>
    @endif

    <x-email.details :rows="$rows" />

    <p style="margin:0; font-size:15px; color:#5b6779;">@if ($deposit){{ __('emails.confirmed.other') }} @endif{{ __('emails.questions') }}</p>
    <p style="margin:18px 0 0; font-family:Georgia, serif; font-size:16px; color:#bc7625;">{{ __('emails.team') }}</p>
</x-email.layout>
