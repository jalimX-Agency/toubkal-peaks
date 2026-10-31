<x-email.layout :title="__('emails.confirmed.title', ['name' => $booking->first_name])" :preheader="__('emails.confirmed.preheader', ['deposit' => $deposit])" :eyebrow="__('emails.confirmed.eyebrow')" :lang="app()->getLocale()">
    <p style="margin:0;">{{ __('emails.confirmed.intro', ['deposit' => $deposit]) }}</p>

    <x-email.button :href="$depositUrl">{{ __('emails.confirmed.button', ['deposit' => $deposit]) }}</x-email.button>

    <p style="margin:0; font-size:14px; color:#5b6779;">{{ __('emails.confirmed.note', ['reference' => $booking->reference]) }}</p>

    <x-email.details :rows="$rows" />

    <p style="margin:0; font-size:15px; color:#5b6779;">{{ __('emails.confirmed.other') }} {{ __('emails.questions') }}</p>
    <p style="margin:18px 0 0; font-family:Georgia, serif; font-size:16px; color:#bc7625;">{{ __('emails.team') }}</p>
</x-email.layout>
