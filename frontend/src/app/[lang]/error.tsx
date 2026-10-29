"use client";

import { usePathname } from "next/navigation";
import { site, whatsappLink } from "@/lib/site";

// The error boundary cannot load the dictionaries, so its few words live here.
const TEXT = {
  en: { title: "This page could not load", text: "Our booking system did not answer in time. Please try again in a moment.", retry: "Try again", whatsapp: "Ask us on WhatsApp" },
  fr: { title: "Cette page n'a pas pu s'afficher", text: "Notre système de réservation n'a pas répondu à temps. Réessayez dans un instant.", retry: "Réessayer", whatsapp: "Nous écrire sur WhatsApp" },
  es: { title: "No se ha podido cargar esta página", text: "Nuestro sistema de reservas no ha respondido a tiempo. Inténtalo de nuevo en un momento.", retry: "Reintentar", whatsapp: "Escríbenos por WhatsApp" },
  de: { title: "Diese Seite konnte nicht geladen werden", text: "Unser Buchungssystem hat nicht rechtzeitig geantwortet. Bitte versuchen Sie es gleich noch einmal.", retry: "Erneut versuchen", whatsapp: "Fragen Sie uns per WhatsApp" },
} as const;

/** A temporary API failure (rate limit, host check): a 500 that search engines retry, not a "not found". */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const first = usePathname().split("/")[1];
  const t = TEXT[(first in TEXT ? first : "en") as keyof typeof TEXT];

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-4 py-16">
      <p className="mono text-gold">500</p>
      <h1 className="heading mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)]">{t.title}</h1>
      <p className="mt-3 text-muted">{t.text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-gold">{t.retry}</button>
        <a href={whatsappLink(site.name)} target="_blank" rel="noopener noreferrer" className="btn-outline-navy">{t.whatsapp}</a>
      </div>
    </section>
  );
}
