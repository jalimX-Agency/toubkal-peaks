"use client";

import { usePathname, useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { site, whatsappLink } from "@/lib/site";

// The error boundary cannot load the dictionaries, so its few words live here.
const TEXT = {
  en: { title: "This page could not load", text: "Our booking system did not answer in time. Please try again in a moment.", retry: "Try again", retrying: "Trying again…", whatsapp: "Ask us on WhatsApp" },
  fr: { title: "Cette page n'a pas pu s'afficher", text: "Notre système de réservation n'a pas répondu à temps. Réessayez dans un instant.", retry: "Réessayer", retrying: "Nouvel essai…", whatsapp: "Nous écrire sur WhatsApp" },
  es: { title: "No se ha podido cargar esta página", text: "Nuestro sistema de reservas no ha respondido a tiempo. Inténtalo de nuevo en un momento.", retry: "Reintentar", retrying: "Reintentando…", whatsapp: "Escríbenos por WhatsApp" },
  de: { title: "Diese Seite konnte nicht geladen werden", text: "Unser Buchungssystem hat nicht rechtzeitig geantwortet. Bitte versuchen Sie es gleich noch einmal.", retry: "Erneut versuchen", retrying: "Neuer Versuch…", whatsapp: "Fragen Sie uns per WhatsApp" },
} as const;

const AUTO_RETRY_MS = 3000;

/**
 * A temporary API failure (rate limit, host check): a 500 that search engines retry, not a "not found".
 * The page tries again by itself once after a few seconds (the API usually answers the second time);
 * a second failure for the same address within a minute waits for the visitor's click.
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const first = pathname.split("/")[1];
  const t = TEXT[(first in TEXT ? first : "en") as keyof typeof TEXT];
  const [retrying, setRetrying] = useState(false);

  const retry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 8000); // if it fails again, the button comes back
    // the failure happened on the server: fetch the page again, then re-render
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  useEffect(() => {
    const key = `tp-retry:${pathname}`;
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(key)) || 0;
    } catch {
      // storage unavailable (private mode): keep the automatic retry
    }
    if (Date.now() - last < 60_000) return;
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(key, String(Date.now()));
      } catch {}
      retry();
    }, AUTO_RETRY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per failed address
  }, [pathname]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center px-4 pb-16 pt-32 md:pt-36">
      <p className="mono text-gold">500</p>
      <h1 className="heading mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)]">{t.title}</h1>
      <p className="mt-3 text-muted">{t.text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={retry} disabled={retrying} className="btn-gold disabled:opacity-70">
          {retrying ? t.retrying : t.retry}
        </button>
        <a href={whatsappLink(site.name)} target="_blank" rel="noopener noreferrer" className="btn-outline-navy">{t.whatsapp}</a>
      </div>
    </section>
  );
}
