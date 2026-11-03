import type { Locale } from "@/i18n/config";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}

/**
 * Legal notice and privacy policy. They describe what the site really does: personal data only from the
 * booking/contact form, and analytics and advertising measurement (Google) only after the visitor accepts the banner. "{registration}" is replaced by the company numbers.
 * To review with the client before launch: full postal address, legal form and ICE number, retention period.
 */
export const legal: Record<Locale, { notice: LegalPage; privacy: LegalPage }> = {
  en: {
    notice: {
      title: "Legal notice",
      description: "Publisher, registration and hosting of the Toubkal Peaks Travel website.",
      updated: "Last updated: October 2026",
      sections: [
        { heading: "Publisher", body: ["Toubkal Peaks Travel, tour operator based in Marrakech, Morocco.", "Email: info@toubkal-peaks.com · Phone and WhatsApp: +212 661 283 086, +212 670 414 623.", "Office: {address}, Morocco.", "Company registration: {registration}."] },
        { heading: "Hosting", body: ["Website: Vercel Inc. (vercel.com).", "Booking system and database: 20i Ltd (20i.com).", "Images and media: Cloudflare, Inc. (cloudflare.com)."] },
        { heading: "Intellectual property", body: ["Texts, logo and the client's own photographs belong to Toubkal Peaks Travel and may not be reused without written permission.", "Some landscape photographs come from Pexels and are used under the Pexels licence."] },
        { heading: "Prices and bookings", body: ["Prices shown are per person for private trips and may change. A booking request sent through the website is not a confirmed booking: availability and the final price are confirmed by email."] },
      ],
    },
    privacy: {
      title: "Privacy policy",
      description: "What personal data the Toubkal Peaks Travel website collects, why, and your rights.",
      updated: "Last updated: October 2026",
      sections: [
        { heading: "Who is responsible", body: ["Toubkal Peaks Travel, Marrakech, Morocco (info@toubkal-peaks.com) is responsible for the personal data collected on this website.", "Company registration: {registration}."] },
        { heading: "What we collect", body: ["Only what you send us through the booking or contact form: first and last name, email, phone number, country, preferred dates, number of travellers and your message.", "If you write to us on WhatsApp or by email, we receive the details you choose to share there."] },
        { heading: "Why we use it", body: ["To answer your request, prepare your itinerary and price, and organise your trip if you book. We do not sell your data and we do not use it for advertising.", "The legal basis is your consent when you send the form and, if you book, the performance of the trip contract."] },
        { heading: "Who receives it", body: ["Our team, and the providers that run the website for us: Vercel (website), 20i (booking system and database), Resend (sending emails) and Cloudflare (media). They only process the data to provide their service.", "Some of these providers are located outside Morocco and the European Union; they apply appropriate safeguards for international transfers."] },
        { heading: "How long we keep it", body: ["Requests that do not become a booking are deleted after 3 years. Booking records are kept as long as required by accounting and tax obligations."] },
        { heading: "Cookies", body: ["We use Google Analytics and Google Ads measurement (cookies and similar technologies) only if you accept them in the banner shown on your first visit. They tell us how many people visit the site, from which country, which pages they read and whether a visit leads to a booking request, so that we can improve the site and our advertising. Google may process this data on servers outside the European Union. Without your consent no analytics or advertising cookie is set and nothing is sent to Google. You can change your choice at any time with “Cookie settings” in the footer."] },
        { heading: "Your rights", body: ["You can ask to access, correct or delete your data, or object to its use, by writing to info@toubkal-peaks.com. These rights are provided by Moroccan law 09-08 (CNDP) and, for visitors in the European Union, by the GDPR. You can also complain to your data protection authority."] },
      ],
    },
  },
  fr: {
    notice: {
      title: "Mentions légales",
      description: "Éditeur, immatriculation et hébergement du site Toubkal Peaks Travel.",
      updated: "Dernière mise à jour : octobre 2026",
      sections: [
        { heading: "Éditeur", body: ["Toubkal Peaks Travel, organisateur de voyages basé à Marrakech, Maroc.", "E-mail : info@toubkal-peaks.com · Téléphone et WhatsApp : +212 661 283 086, +212 670 414 623.", "Bureau : {address}, Maroc.", "Immatriculation : {registration}."] },
        { heading: "Hébergement", body: ["Site web : Vercel Inc. (vercel.com).", "Système de réservation et base de données : 20i Ltd (20i.com).", "Images et médias : Cloudflare, Inc. (cloudflare.com)."] },
        { heading: "Propriété intellectuelle", body: ["Les textes, le logo et les photographies propres à Toubkal Peaks Travel lui appartiennent et ne peuvent être réutilisés sans autorisation écrite.", "Certaines photographies de paysages proviennent de Pexels et sont utilisées selon la licence Pexels."] },
        { heading: "Prix et réservations", body: ["Les prix affichés sont par personne pour des voyages privés et peuvent évoluer. Une demande envoyée par le site n'est pas une réservation confirmée : la disponibilité et le prix final sont confirmés par e-mail."] },
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      description: "Les données personnelles collectées par le site Toubkal Peaks Travel, pourquoi, et vos droits.",
      updated: "Dernière mise à jour : octobre 2026",
      sections: [
        { heading: "Responsable", body: ["Toubkal Peaks Travel, Marrakech, Maroc (info@toubkal-peaks.com) est responsable des données personnelles collectées sur ce site.", "Immatriculation : {registration}."] },
        { heading: "Données collectées", body: ["Uniquement ce que vous nous envoyez par le formulaire de réservation ou de contact : prénom et nom, e-mail, téléphone, pays, dates souhaitées, nombre de voyageurs et votre message.", "Si vous nous écrivez sur WhatsApp ou par e-mail, nous recevons les informations que vous choisissez d'y partager."] },
        { heading: "Utilisation", body: ["Pour répondre à votre demande, préparer votre itinéraire et votre prix, et organiser votre voyage si vous réservez. Nous ne vendons pas vos données et ne les utilisons pas à des fins publicitaires.", "La base légale est votre consentement lors de l'envoi du formulaire et, si vous réservez, l'exécution du contrat de voyage."] },
        { heading: "Destinataires", body: ["Notre équipe et les prestataires qui font fonctionner le site : Vercel (site web), 20i (réservations et base de données), Resend (envoi des e-mails) et Cloudflare (médias). Ils ne traitent les données que pour fournir leur service.", "Certains de ces prestataires sont situés hors du Maroc et de l'Union européenne ; ils appliquent des garanties appropriées pour les transferts internationaux."] },
        { heading: "Durée de conservation", body: ["Les demandes qui ne donnent pas lieu à une réservation sont supprimées après 3 ans. Les dossiers de réservation sont conservés aussi longtemps que l'exigent les obligations comptables et fiscales."] },
        { heading: "Cookies", body: ["Nous utilisons Google Analytics et la mesure de Google Ads (cookies et technologies similaires) uniquement si vous les acceptez dans le bandeau affiché lors de votre première visite. Ils nous indiquent combien de personnes visitent le site, depuis quel pays, quelles pages elles lisent et si une visite mène à une demande de réservation, afin d'améliorer le site et notre publicité. Google peut traiter ces données sur des serveurs situés hors de l'Union européenne. Sans votre consentement, aucun cookie d'analyse ou de publicité n'est déposé et rien n'est envoyé à Google. Vous pouvez modifier votre choix à tout moment via « Paramètres des cookies » en bas de page."] },
        { heading: "Vos droits", body: ["Vous pouvez demander l'accès, la rectification ou la suppression de vos données, ou vous opposer à leur utilisation, en écrivant à info@toubkal-peaks.com. Ces droits sont prévus par la loi marocaine 09-08 (CNDP) et, pour les visiteurs de l'Union européenne, par le RGPD. Vous pouvez aussi saisir votre autorité de protection des données."] },
      ],
    },
  },
  es: {
    notice: {
      title: "Aviso legal",
      description: "Editor, registro y alojamiento del sitio web de Toubkal Peaks Travel.",
      updated: "Última actualización: octubre de 2026",
      sections: [
        { heading: "Editor", body: ["Toubkal Peaks Travel, operador de viajes con sede en Marrakech, Marruecos.", "Correo: info@toubkal-peaks.com · Teléfono y WhatsApp: +212 661 283 086, +212 670 414 623.", "Oficina: {address}, Marruecos.", "Registro de la empresa: {registration}."] },
        { heading: "Alojamiento", body: ["Sitio web: Vercel Inc. (vercel.com).", "Sistema de reservas y base de datos: 20i Ltd (20i.com).", "Imágenes y contenidos multimedia: Cloudflare, Inc. (cloudflare.com)."] },
        { heading: "Propiedad intelectual", body: ["Los textos, el logotipo y las fotografías propias pertenecen a Toubkal Peaks Travel y no pueden reutilizarse sin autorización por escrito.", "Algunas fotografías de paisajes proceden de Pexels y se usan según la licencia de Pexels."] },
        { heading: "Precios y reservas", body: ["Los precios indicados son por persona para viajes privados y pueden cambiar. Una solicitud enviada desde el sitio no es una reserva confirmada: la disponibilidad y el precio final se confirman por correo."] },
      ],
    },
    privacy: {
      title: "Política de privacidad",
      description: "Qué datos personales recoge el sitio de Toubkal Peaks Travel, para qué y cuáles son tus derechos.",
      updated: "Última actualización: octubre de 2026",
      sections: [
        { heading: "Responsable", body: ["Toubkal Peaks Travel, Marrakech, Marruecos (info@toubkal-peaks.com) es responsable de los datos personales recogidos en este sitio.", "Registro de la empresa: {registration}."] },
        { heading: "Qué datos recogemos", body: ["Solo lo que nos envías con el formulario de reserva o de contacto: nombre y apellidos, correo, teléfono, país, fechas preferidas, número de viajeros y tu mensaje.", "Si nos escribes por WhatsApp o por correo, recibimos los datos que decidas compartir allí."] },
        { heading: "Para qué los usamos", body: ["Para responder a tu solicitud, preparar tu itinerario y tu precio, y organizar tu viaje si reservas. No vendemos tus datos ni los usamos con fines publicitarios.", "La base legal es tu consentimiento al enviar el formulario y, si reservas, la ejecución del contrato de viaje."] },
        { heading: "Quién los recibe", body: ["Nuestro equipo y los proveedores que hacen funcionar el sitio: Vercel (sitio web), 20i (reservas y base de datos), Resend (envío de correos) y Cloudflare (contenidos multimedia). Solo tratan los datos para prestar su servicio.", "Algunos de estos proveedores están fuera de Marruecos y de la Unión Europea; aplican garantías adecuadas para las transferencias internacionales."] },
        { heading: "Cuánto tiempo los guardamos", body: ["Las solicitudes que no se convierten en reserva se eliminan a los 3 años. Los expedientes de reserva se conservan el tiempo que exigen las obligaciones contables y fiscales."] },
        { heading: "Cookies", body: ["Usamos Google Analytics y la medición de Google Ads (cookies y tecnologías similares) solo si los aceptas en el aviso que aparece en tu primera visita. Nos indican cuántas personas visitan el sitio, desde qué país, qué páginas leen y si una visita termina en una solicitud de reserva, para mejorar el sitio y nuestra publicidad. Google puede tratar estos datos en servidores situados fuera de la Unión Europea. Sin tu consentimiento no se instala ninguna cookie de análisis ni de publicidad y no se envía nada a Google. Puedes cambiar tu decisión en cualquier momento en «Configuración de cookies» al pie de la página."] },
        { heading: "Tus derechos", body: ["Puedes solicitar el acceso, la rectificación o la supresión de tus datos, u oponerte a su uso, escribiendo a info@toubkal-peaks.com. Estos derechos están reconocidos por la ley marroquí 09-08 (CNDP) y, para los visitantes de la Unión Europea, por el RGPD. También puedes reclamar ante tu autoridad de protección de datos."] },
      ],
    },
  },
  de: {
    notice: {
      title: "Impressum",
      description: "Herausgeber, Registrierung und Hosting der Website von Toubkal Peaks Travel.",
      updated: "Stand: Oktober 2026",
      sections: [
        { heading: "Herausgeber", body: ["Toubkal Peaks Travel, Reiseveranstalter mit Sitz in Marrakesch, Marokko.", "E-Mail: info@toubkal-peaks.com · Telefon und WhatsApp: +212 661 283 086, +212 670 414 623.", "Büro: {address}, Marokko.", "Unternehmensregistrierung: {registration}."] },
        { heading: "Hosting", body: ["Website: Vercel Inc. (vercel.com).", "Buchungssystem und Datenbank: 20i Ltd (20i.com).", "Bilder und Medien: Cloudflare, Inc. (cloudflare.com)."] },
        { heading: "Urheberrecht", body: ["Texte, Logo und eigene Fotos gehören Toubkal Peaks Travel und dürfen ohne schriftliche Genehmigung nicht weiterverwendet werden.", "Einige Landschaftsfotos stammen von Pexels und werden gemäß der Pexels-Lizenz verwendet."] },
        { heading: "Preise und Buchungen", body: ["Die angegebenen Preise gelten pro Person für private Reisen und können sich ändern. Eine über die Website gesendete Anfrage ist keine bestätigte Buchung: Verfügbarkeit und Endpreis werden per E-Mail bestätigt."] },
      ],
    },
    privacy: {
      title: "Datenschutzerklärung",
      description: "Welche personenbezogenen Daten die Website von Toubkal Peaks Travel erhebt, wozu, und Ihre Rechte.",
      updated: "Stand: Oktober 2026",
      sections: [
        { heading: "Verantwortlicher", body: ["Toubkal Peaks Travel, Marrakesch, Marokko (info@toubkal-peaks.com) ist für die auf dieser Website erhobenen personenbezogenen Daten verantwortlich.", "Unternehmensregistrierung: {registration}."] },
        { heading: "Welche Daten wir erheben", body: ["Nur das, was Sie uns über das Buchungs- oder Kontaktformular senden: Vor- und Nachname, E-Mail, Telefonnummer, Land, Wunschtermine, Anzahl der Reisenden und Ihre Nachricht.", "Wenn Sie uns per WhatsApp oder E-Mail schreiben, erhalten wir die Angaben, die Sie dort teilen."] },
        { heading: "Wozu wir sie nutzen", body: ["Um Ihre Anfrage zu beantworten, Route und Preis vorzubereiten und Ihre Reise zu organisieren, wenn Sie buchen. Wir verkaufen Ihre Daten nicht und nutzen sie nicht für Werbung.", "Rechtsgrundlage ist Ihre Einwilligung beim Absenden des Formulars und, wenn Sie buchen, die Erfüllung des Reisevertrags."] },
        { heading: "Wer sie erhält", body: ["Unser Team und die Dienstleister, die die Website für uns betreiben: Vercel (Website), 20i (Buchungssystem und Datenbank), Resend (E-Mail-Versand) und Cloudflare (Medien). Sie verarbeiten die Daten nur zur Erbringung ihres Dienstes.", "Einige dieser Dienstleister befinden sich außerhalb Marokkos und der Europäischen Union; sie wenden geeignete Garantien für internationale Übermittlungen an."] },
        { heading: "Speicherdauer", body: ["Anfragen, aus denen keine Buchung wird, werden nach 3 Jahren gelöscht. Buchungsunterlagen werden so lange aufbewahrt, wie es buchhalterische und steuerliche Pflichten verlangen."] },
        { heading: "Cookies", body: ["Wir nutzen Google Analytics und die Messung von Google Ads (Cookies und ähnliche Technologien) nur, wenn Sie im Banner bei Ihrem ersten Besuch zustimmen. Sie zeigen uns, wie viele Personen die Website besuchen, aus welchem Land, welche Seiten sie lesen und ob ein Besuch zu einer Buchungsanfrage führt, damit wir die Website und unsere Werbung verbessern können. Google kann diese Daten auf Servern außerhalb der Europäischen Union verarbeiten. Ohne Ihre Einwilligung wird kein Analyse- oder Werbe-Cookie gesetzt und nichts an Google gesendet. Sie können Ihre Entscheidung jederzeit über „Cookie-Einstellungen“ im Fußbereich ändern."] },
        { heading: "Ihre Rechte", body: ["Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen oder deren Nutzung widersprechen, indem Sie an info@toubkal-peaks.com schreiben. Diese Rechte ergeben sich aus dem marokkanischen Gesetz 09-08 (CNDP) und für Besucher aus der Europäischen Union aus der DSGVO. Sie können sich auch bei Ihrer Datenschutzbehörde beschweren."] },
      ],
    },
  },
};
