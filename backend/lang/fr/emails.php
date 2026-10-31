<?php

// Customer emails (the language of the booking). Team emails stay in English.

return [
    'team' => 'L\'équipe Toubkal Peaks',
    'questions' => 'Une question ? Répondez simplement à cet e-mail ou écrivez-nous sur WhatsApp.',
    'labels' => [
        'reference' => 'Référence',
        'trip' => 'Voyage',
        'date' => 'Date de départ',
        'travellers' => 'Voyageurs',
        'estimate' => 'Prix estimé',
    ],
    'custom_trip' => 'Voyage sur mesure',
    'no_date' => 'Pas encore fixée',
    'adults' => '{1} :count adulte|[2,*] :count adultes',
    'children' => '{1} :count enfant|[2,*] :count enfants',
    'estimate_value' => ':total (:per par personne, à confirmer)',
    'quote' => 'Nous vous enverrons un devis personnalisé.',
    'received' => [
        'subject' => 'Nous avons bien reçu votre demande :reference',
        'preheader' => 'Nous vous répondons sous 24 heures avec les disponibilités et le prix final.',
        'eyebrow' => 'Demande de réservation',
        'title' => 'Merci, :name',
        'intro' => 'Nous avons bien reçu votre demande. Un membre de notre équipe vérifie les disponibilités et vous répond sous 24 heures avec le prix final. Rien n\'est débité à ce stade.',
        'next' => 'La suite',
        'step1' => 'Nous vérifions les disponibilités et vous envoyons le prix final, en général sous 24 heures.',
        'step2' => 'Pour bloquer vos dates, vous versez un acompte de :deposit par PayPal une fois notre confirmation reçue. Il est déduit du prix total.',
        'step3' => 'Nous préparons votre voyage et vous envoyons toutes les informations pratiques.',
    ],
    'deposit_link' => 'Lien PayPal pour l\'acompte',
    'confirmed' => [
        'subject' => 'Votre voyage est disponible : :reference',
        'preheader' => 'Bloquez vos dates avec un acompte de :deposit par PayPal.',
        'eyebrow' => 'Disponibilité confirmée',
        'title' => 'Bonne nouvelle, :name : votre voyage est disponible',
        'intro' => 'Nous avons confirmé la disponibilité de votre voyage. Pour bloquer vos dates, merci de verser un acompte de :deposit par PayPal.',
        'button' => 'Payer l\'acompte de :deposit avec PayPal',
        'note' => 'Merci d\'indiquer votre référence :reference dans le message PayPal. L\'acompte est déduit du prix total. Dès sa réception, nous confirmons votre réservation et vous envoyons le détail de votre voyage.',
        'other' => 'Vous préférez un autre moyen de paiement ? Répondez à cet e-mail et nous trouverons une solution.',
    ],
];
