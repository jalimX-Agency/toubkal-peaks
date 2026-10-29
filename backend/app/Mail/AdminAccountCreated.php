<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Admin access for a team member, with a temporary password to change at first sign-in. */
class AdminAccountCreated extends Mailable
{
    public function __construct(public User $user, public string $password) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Toubkal Peaks admin access');
    }

    public function content(): Content
    {
        $site = rtrim(trim(explode(',', (string) config('services.frontend.url'))[0]), '/');

        return new Content(view: 'emails.admin-account', with: ['loginUrl' => "{$site}/admin/login"]);
    }
}
