<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Next.js website: its cache is refreshed when content changes (App\Support\FrontendCache).
    'frontend' => [
        'url' => env('FRONTEND_URL'),
        'revalidate_secret' => env('REVALIDATE_SECRET'),
    ],

    // Deposit asked to secure a booking once availability is confirmed (paid by PayPal).
    'payments' => [
        'paypal_url' => env('PAYPAL_URL', 'https://paypal.me/OmarAitlmouden'),
        'deposit' => (int) env('BOOKING_DEPOSIT', 50),
        'deposit_currency' => env('BOOKING_DEPOSIT_CURRENCY', 'EUR'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
