<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Cloudflare Turnstile: the "are you a person?" check of the booking forms. The secret key is read from
 * TURNSTILE_SECRET in the server's .env (never from the code); while it is not set, nothing is checked.
 */
class Turnstile
{
    private const URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function enabled(): bool
    {
        return filled(config('services.turnstile.secret'));
    }

    /**
     * True when the visitor passed the check. A missing or refused token fails; if Cloudflare itself cannot be
     * reached the check is skipped (a real customer is never lost to an outage: the honeypot and the rate
     * limit still apply).
     */
    public function passes(?string $token, ?string $ip = null): bool
    {
        if (! $this->enabled()) {
            return true;
        }
        if (blank($token) || strlen($token) > 2048) {
            return false;
        }

        try {
            $response = Http::asForm()->timeout(5)->post(self::URL, array_filter([
                'secret' => config('services.turnstile.secret'),
                'response' => $token,
                'remoteip' => $ip,
            ]));
        } catch (Throwable $e) {
            Log::warning('Turnstile could not be reached: '.$e->getMessage());

            return true;
        }

        if ($response->serverError()) {
            Log::warning('Turnstile answered with an error: '.$response->status());

            return true;
        }

        return $response->json('success') === true;
    }
}
