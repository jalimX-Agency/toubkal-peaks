<x-email.layout :title="'Hello '.$user->name" :preheader="'Your access to the Toubkal Peaks admin'" :eyebrow="'Admin access'">
    <p style="margin:0;">You now have access to the Toubkal Peaks admin as {{ $user->role->value === 'admin' ? 'an administrator' : 'a team member' }}.</p>

    <x-email.details :rows="[
        'Email' => $user->email,
        'Temporary password' => $password,
    ]" />

    <x-email.button :href="$loginUrl">Sign in to the admin</x-email.button>

    <p style="margin:0; font-size:14px; color:#5b6779;">You will choose your own password when you sign in for the first time. If you did not expect this email, you can ignore it.</p>
</x-email.layout>
