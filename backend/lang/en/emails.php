<?php

// Customer emails (the language of the booking). Team emails stay in English.

return [
    'team' => 'The Toubkal Peaks team',
    'questions' => 'Any question? Just reply to this email or write to us on WhatsApp.',
    'labels' => [
        'reference' => 'Reference',
        'trip' => 'Trip',
        'date' => 'Start date',
        'travellers' => 'Travellers',
        'estimate' => 'Estimated price',
    ],
    'custom_trip' => 'Tailor-made trip',
    'no_date' => 'Not decided yet',
    'adults' => '{1} :count adult|[2,*] :count adults',
    'children' => '{1} :count child|[2,*] :count children',
    'estimate_value' => ':total (:per per person, to be confirmed)',
    'quote' => 'We will send you a personal quote.',
    'received' => [
        'subject' => 'We received your request :reference',
        'preheader' => 'We reply within 24 hours with availability and the final price.',
        'eyebrow' => 'Booking request',
        'title' => 'Thank you, :name',
        'intro' => 'We have received your request. A member of our team checks availability and replies within 24 hours with the final price. Nothing is charged at this stage.',
        'next' => 'What happens next',
        'step1' => 'We check availability and send you the final price, usually within 24 hours.',
        'step2' => 'To secure your dates, you pay a deposit of :deposit by PayPal once we have confirmed. It is deducted from the total price.',
        'step3' => 'We prepare your trip and send you all the practical details.',
    ],
    'deposit_link' => 'PayPal deposit link',
    'confirmed' => [
        'subject' => 'Your trip is available: :reference',
        'preheader' => 'Secure your dates with a :deposit deposit by PayPal.',
        'eyebrow' => 'Availability confirmed',
        'title' => 'Good news, :name: your trip is available',
        'intro' => 'We have confirmed availability for your trip. To secure your dates, please pay a deposit of :deposit by PayPal.',
        'button' => 'Pay the :deposit deposit with PayPal',
        'note' => 'Please write your reference :reference in the PayPal note. The deposit is deducted from the total price. As soon as we receive it, we confirm your booking and send you the details of your trip.',
        'other' => 'Prefer another way to pay? Reply to this email and we will find a solution.',
    ],
];
