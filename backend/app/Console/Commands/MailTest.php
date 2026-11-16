<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\BookingController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class MailTest extends Command
{
    protected $signature = 'toubkal:mail-test {--to= : Send to this address instead of the team inboxes}';

    protected $description = 'Show how the server sends email (the password is never shown) and send one test message to the team inboxes, with the exact error if it fails';

    public function handle(): int
    {
        $mailer = (string) config('mail.default');
        $config = (array) config("mail.mailers.{$mailer}", []);
        $to = $this->option('to') ? [(string) $this->option('to')] : BookingController::teamRecipients();

        $this->line('Mailer: '.$mailer.' (transport: '.($config['transport'] ?? '?').')');
        if (($config['transport'] ?? null) === 'smtp') {
            $this->line('SMTP: '.($config['host'] ?? '?').':'.($config['port'] ?? '?').' · scheme '.($config['scheme'] ?? 'default').' · user '.($config['username'] ?? '(none)').' · password '.(filled($config['password'] ?? null) ? 'set' : 'NOT SET'));
        }
        $this->line('From: '.config('mail.from.address').' ('.config('mail.from.name').')');
        $this->line('BOOKING_NOTIFY_EMAIL: '.(filled(config('mail.booking_notify')) ? config('mail.booking_notify') : '(empty: the From address is used)'));
        $this->line('Team recipients: '.implode(', ', $to));
        $this->line('Reply-to: '.config('mail.booking_reply_to'));

        if (in_array($mailer, ['log', 'array'], true)) {
            $this->warn("The mailer is \"{$mailer}\": messages are written to the log and NEVER sent. Set MAIL_MAILER=smtp (or another real one) in .env.");
        }
        if (str_ends_with((string) config('mail.from.address'), '@example.com')) {
            $this->warn('The From address is still the example one: set MAIL_FROM_ADDRESS in .env.');
        }

        try {
            Mail::raw("This is a test from the Toubkal Peaks website server.\nIf you read it, the team alerts for new booking requests can reach this inbox.\nSent: ".now()->toDateTimeString(), function ($message) use ($to) {
                $message->to($to)->subject('Test: team alerts of the Toubkal Peaks website');
            });
        } catch (Throwable $e) {
            $this->error('SENDING FAILED: '.get_class($e).': '.$e->getMessage());

            return self::FAILURE;
        }

        $this->info('Sent to the mail server without an error. Check the inbox (and the spam folder) of: '.implode(', ', $to));

        return self::SUCCESS;
    }
}
