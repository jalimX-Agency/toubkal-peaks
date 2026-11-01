import type { Locale } from "@/i18n/config";

/** Category of the trips the conditions apply to (the Mount Toubkal treks). */
export const TOUBKAL_CATEGORY = "treks.toubkal";

export interface TrekkingConditions {
  title: string;
  intro: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  /** Checkbox of the booking request, and its error. */
  accept: string;
  acceptRequired: string;
  /** Label of the folded text in the booking request. */
  read: string;
}

/**
 * The owner's conditions for Mount Toubkal treks, shown on those trips and accepted when requesting one.
 * The API stores which version the customer accepted (Tour::CONDITIONS_VERSION in the backend): change
 * that constant whenever the text below changes.
 */
export const trekkingConditions: Record<Locale, TrekkingConditions> = {
  en: {
    title: "Important information: Mount Toubkal trekking conditions",
    intro: "Please read the following information carefully before confirming your Mount Toubkal trekking reservation.",
    sections: [
      {
        heading: "Weather conditions and safety",
        body: [
          "Reaching the Mount Toubkal summit (4,167 m) cannot be guaranteed.",
          "Weather conditions in the High Atlas Mountains can change unexpectedly. In the event of severe weather, heavy snowfall, strong winds or other unsafe conditions, the local authorities may decide to close the trekking trails, including:",
        ],
        list: ["The trail between Imlil and the Toubkal Refuge.", "The trail between the Toubkal Refuge and the Mount Toubkal summit."],
      },
      {
        heading: "Safety first",
        body: ["The safety of our guests, guides and staff is always our highest priority. We strictly respect all decisions and instructions issued by the local authorities."],
      },
      {
        heading: "Alternative itinerary and refund policy",
        body: [
          "If the weather deteriorates or the authorities close either of these routes, we reserve the right to modify the original itinerary and arrange an alternative trek or activity, depending on weather conditions and safety.",
          "Please understand that reaching the refuge or summit may become impossible for reasons beyond our control. Such circumstances do not automatically entitle participants to a refund. No refund will be provided solely because of adverse weather conditions, official trail closures or the inability to reach the summit.",
        ],
      },
      {
        heading: "Confirmation of agreement",
        body: ["By confirming your reservation, you acknowledge that you have read, understood and accepted these trekking conditions."],
      },
    ],
    accept: "I have read and accept the Mount Toubkal trekking conditions.",
    acceptRequired: "Please accept the trekking conditions to send your request.",
    read: "Read the Mount Toubkal trekking conditions",
  },
  fr: {
    title: "Informations importantes : conditions du trek au Toubkal",
    intro: "Veuillez lire attentivement les informations suivantes avant de confirmer votre réservation d'un trek au Toubkal.",
    sections: [
      {
        heading: "Conditions météorologiques et sécurité",
        body: [
          "L'atteinte du sommet du Toubkal (4 167 m) ne peut pas être garantie.",
          "Les conditions météorologiques dans le Haut Atlas peuvent changer de façon imprévue. En cas de mauvais temps, de fortes chutes de neige, de vents violents ou d'autres conditions dangereuses, les autorités locales peuvent décider de fermer les sentiers de randonnée, notamment :",
        ],
        list: ["Le sentier entre Imlil et le refuge du Toubkal.", "Le sentier entre le refuge du Toubkal et le sommet du Toubkal."],
      },
      {
        heading: "La sécurité avant tout",
        body: ["La sécurité de nos clients, de nos guides et de notre personnel est toujours notre priorité absolue. Nous respectons strictement toutes les décisions et instructions des autorités locales."],
      },
      {
        heading: "Itinéraire de remplacement et remboursement",
        body: [
          "Si la météo se dégrade ou si les autorités ferment l'un de ces itinéraires, nous nous réservons le droit de modifier l'itinéraire initial et d'organiser un autre trek ou une autre activité, selon la météo et la sécurité.",
          "Atteindre le refuge ou le sommet peut devenir impossible pour des raisons indépendantes de notre volonté. Ces circonstances ne donnent pas automatiquement droit à un remboursement. Aucun remboursement ne sera accordé uniquement en raison de mauvaises conditions météorologiques, de fermetures officielles de sentiers ou de l'impossibilité d'atteindre le sommet.",
        ],
      },
      {
        heading: "Confirmation de l'accord",
        body: ["En confirmant votre réservation, vous reconnaissez avoir lu, compris et accepté ces conditions de trek."],
      },
    ],
    accept: "J'ai lu et j'accepte les conditions du trek au Toubkal.",
    acceptRequired: "Veuillez accepter les conditions du trek pour envoyer votre demande.",
    read: "Lire les conditions du trek au Toubkal",
  },
  es: {
    title: "Información importante: condiciones del trekking al Toubkal",
    intro: "Lee con atención la siguiente información antes de confirmar tu reserva del trekking al Toubkal.",
    sections: [
      {
        heading: "Condiciones meteorológicas y seguridad",
        body: [
          "No se puede garantizar llegar a la cima del Toubkal (4.167 m).",
          "Las condiciones meteorológicas en el Alto Atlas pueden cambiar de forma inesperada. En caso de mal tiempo, fuertes nevadas, vientos fuertes u otras condiciones peligrosas, las autoridades locales pueden decidir cerrar los senderos, entre ellos:",
        ],
        list: ["El sendero entre Imlil y el refugio del Toubkal.", "El sendero entre el refugio del Toubkal y la cima del Toubkal."],
      },
      {
        heading: "La seguridad, lo primero",
        body: ["La seguridad de nuestros clientes, guías y personal es siempre nuestra máxima prioridad. Respetamos estrictamente todas las decisiones e instrucciones de las autoridades locales."],
      },
      {
        heading: "Itinerario alternativo y política de reembolso",
        body: [
          "Si el tiempo empeora o las autoridades cierran alguna de estas rutas, nos reservamos el derecho de modificar el itinerario original y organizar otro trekking u otra actividad, según el tiempo y la seguridad.",
          "Ten en cuenta que llegar al refugio o a la cima puede resultar imposible por motivos ajenos a nuestra voluntad. Estas circunstancias no dan derecho automático a un reembolso. No se reembolsará el importe únicamente por mal tiempo, cierres oficiales de senderos o por no poder alcanzar la cima.",
        ],
      },
      {
        heading: "Confirmación del acuerdo",
        body: ["Al confirmar tu reserva, reconoces que has leído, entendido y aceptado estas condiciones del trekking."],
      },
    ],
    accept: "He leído y acepto las condiciones del trekking al Toubkal.",
    acceptRequired: "Acepta las condiciones del trekking para enviar tu solicitud.",
    read: "Leer las condiciones del trekking al Toubkal",
  },
  de: {
    title: "Wichtige Informationen: Bedingungen für die Toubkal-Trekkingtour",
    intro: "Bitte lesen Sie die folgenden Informationen sorgfältig, bevor Sie Ihre Toubkal-Trekkingtour verbindlich buchen.",
    sections: [
      {
        heading: "Wetterbedingungen und Sicherheit",
        body: [
          "Das Erreichen des Gipfels des Toubkal (4.167 m) kann nicht garantiert werden.",
          "Das Wetter im Hohen Atlas kann sich unerwartet ändern. Bei Unwetter, starkem Schneefall, starkem Wind oder anderen gefährlichen Bedingungen können die örtlichen Behörden die Wanderwege sperren, darunter:",
        ],
        list: ["Den Weg zwischen Imlil und der Toubkal-Hütte.", "Den Weg zwischen der Toubkal-Hütte und dem Gipfel des Toubkal."],
      },
      {
        heading: "Sicherheit geht vor",
        body: ["Die Sicherheit unserer Gäste, Guides und Mitarbeiter hat für uns immer oberste Priorität. Wir befolgen alle Entscheidungen und Anweisungen der örtlichen Behörden strikt."],
      },
      {
        heading: "Alternative Route und Erstattung",
        body: [
          "Wenn sich das Wetter verschlechtert oder die Behörden eine dieser Routen sperren, behalten wir uns vor, die ursprüngliche Route zu ändern und je nach Wetter und Sicherheit eine alternative Tour oder Aktivität zu organisieren.",
          "Bitte beachten Sie, dass das Erreichen der Hütte oder des Gipfels aus Gründen, die wir nicht beeinflussen können, unmöglich werden kann. Diese Umstände begründen nicht automatisch einen Anspruch auf Erstattung. Allein wegen schlechten Wetters, offizieller Wegsperrungen oder des Nichterreichens des Gipfels erfolgt keine Erstattung.",
        ],
      },
      {
        heading: "Bestätigung der Vereinbarung",
        body: ["Mit der Bestätigung Ihrer Buchung erklären Sie, dass Sie diese Trekkingbedingungen gelesen, verstanden und akzeptiert haben."],
      },
    ],
    accept: "Ich habe die Trekkingbedingungen für den Toubkal gelesen und akzeptiere sie.",
    acceptRequired: "Bitte akzeptieren Sie die Trekkingbedingungen, um Ihre Anfrage zu senden.",
    read: "Trekkingbedingungen für den Toubkal lesen",
  },
};
