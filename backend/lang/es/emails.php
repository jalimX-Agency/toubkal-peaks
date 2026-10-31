<?php

// Customer emails (the language of the booking). Team emails stay in English.

return [
    'team' => 'El equipo de Toubkal Peaks',
    'questions' => '¿Alguna pregunta? Responde a este correo o escríbenos por WhatsApp.',
    'labels' => [
        'reference' => 'Referencia',
        'trip' => 'Viaje',
        'date' => 'Fecha de inicio',
        'travellers' => 'Viajeros',
        'estimate' => 'Precio estimado',
    ],
    'custom_trip' => 'Viaje a medida',
    'no_date' => 'Aún sin decidir',
    'adults' => '{1} :count adulto|[2,*] :count adultos',
    'children' => '{1} :count niño|[2,*] :count niños',
    'estimate_value' => ':total (:per por persona, a confirmar)',
    'quote' => 'Te enviaremos un presupuesto personalizado.',
    'received' => [
        'subject' => 'Hemos recibido tu solicitud :reference',
        'preheader' => 'Te respondemos en 24 horas con la disponibilidad y el precio final.',
        'eyebrow' => 'Solicitud de reserva',
        'title' => 'Gracias, :name',
        'intro' => 'Hemos recibido tu solicitud. Un miembro de nuestro equipo comprueba la disponibilidad y te responde en 24 horas con el precio final. No se cobra nada por ahora.',
        'next' => 'Próximos pasos',
        'step1' => 'Comprobamos la disponibilidad y te enviamos el precio final, normalmente en 24 horas.',
        'step2' => 'Para reservar tus fechas, pagas un depósito por PayPal cuando te lo confirmemos: te enviamos el importe y el enlace. Se descuenta del precio total.',
        'step3' => 'Preparamos tu viaje y te enviamos toda la información práctica.',
    ],
    'confirmed' => [
        'intro_no_deposit' => 'Hemos confirmado la disponibilidad de tu viaje. Te escribimos muy pronto con los próximos pasos.',
        'subject' => 'Tu viaje está disponible: :reference',
        'preheader' => 'Reserva tus fechas con un depósito de :deposit por PayPal.',
        'eyebrow' => 'Disponibilidad confirmada',
        'title' => 'Buenas noticias, :name: tu viaje está disponible',
        'intro' => 'Hemos confirmado la disponibilidad de tu viaje. Para reservar tus fechas, paga un depósito de :deposit por PayPal.',
        'button' => 'Pagar el depósito de :deposit con PayPal',
        'note' => 'Indica tu referencia :reference en el mensaje de PayPal. El depósito se descuenta del precio total. En cuanto lo recibamos, confirmamos tu reserva y te enviamos los detalles del viaje.',
        'other' => '¿Prefieres otra forma de pago? Responde a este correo y buscaremos una solución.',
    ],
    'deposit_link' => 'Enlace de PayPal para el depósito',
];
