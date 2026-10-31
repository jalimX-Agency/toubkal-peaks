<?php

// Customer emails (the language of the booking). Team emails stay in English.

return [
    'team' => 'Ihr Team von Toubkal Peaks',
    'questions' => 'Fragen? Antworten Sie einfach auf diese E-Mail oder schreiben Sie uns per WhatsApp.',
    'labels' => [
        'reference' => 'Referenz',
        'trip' => 'Reise',
        'date' => 'Startdatum',
        'travellers' => 'Reisende',
        'estimate' => 'Geschätzter Preis',
    ],
    'custom_trip' => 'Individuelle Reise',
    'no_date' => 'Noch offen',
    'adults' => '{1} :count Erwachsener|[2,*] :count Erwachsene',
    'children' => '{1} :count Kind|[2,*] :count Kinder',
    'estimate_value' => ':total (:per pro Person, unverbindlich)',
    'quote' => 'Wir senden Ihnen ein persönliches Angebot.',
    'received' => [
        'subject' => 'Wir haben Ihre Anfrage :reference erhalten',
        'preheader' => 'Wir antworten innerhalb von 24 Stunden mit Verfügbarkeit und Endpreis.',
        'eyebrow' => 'Buchungsanfrage',
        'title' => 'Vielen Dank, :name',
        'intro' => 'Wir haben Ihre Anfrage erhalten. Ein Mitglied unseres Teams prüft die Verfügbarkeit und antwortet Ihnen innerhalb von 24 Stunden mit dem Endpreis. Es wird jetzt nichts berechnet.',
        'next' => 'So geht es weiter',
        'step1' => 'Wir prüfen die Verfügbarkeit und senden Ihnen den Endpreis, meist innerhalb von 24 Stunden.',
        'step2' => 'Um Ihre Termine zu sichern, zahlen Sie nach unserer Bestätigung eine Anzahlung per PayPal: Betrag und Link senden wir Ihnen. Sie wird vom Gesamtpreis abgezogen.',
        'step3' => 'Wir bereiten Ihre Reise vor und senden Ihnen alle praktischen Informationen.',
    ],
    'confirmed' => [
        'intro_no_deposit' => 'Wir haben die Verfügbarkeit Ihrer Reise bestätigt. Wir melden uns in Kürze mit den nächsten Schritten.',
        'subject' => 'Ihre Reise ist verfügbar: :reference',
        'preheader' => 'Sichern Sie Ihre Termine mit einer Anzahlung von :deposit per PayPal.',
        'eyebrow' => 'Verfügbarkeit bestätigt',
        'title' => 'Gute Nachricht, :name: Ihre Reise ist verfügbar',
        'intro' => 'Wir haben die Verfügbarkeit Ihrer Reise bestätigt. Um Ihre Termine zu sichern, zahlen Sie bitte eine Anzahlung von :deposit per PayPal.',
        'button' => 'Anzahlung von :deposit mit PayPal zahlen',
        'note' => 'Bitte geben Sie Ihre Referenz :reference in der PayPal-Nachricht an. Die Anzahlung wird vom Gesamtpreis abgezogen. Sobald sie eingegangen ist, bestätigen wir Ihre Buchung und senden Ihnen die Details Ihrer Reise.',
        'other' => 'Lieber eine andere Zahlungsart? Antworten Sie auf diese E-Mail, wir finden eine Lösung.',
    ],
    'deposit_link' => 'PayPal-Link für die Anzahlung',
];
