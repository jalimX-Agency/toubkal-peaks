import Link from "next/link";
import { TourCard } from "@/components/TourCard";
import { CtaBand } from "@/components/home/CtaBand";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { PagedGrid } from "@/components/ui/Pager";
import type { Place } from "@/content/destinations";
import { explore } from "@/content/explore";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { TRIPS, site } from "@/lib/site";
import type { TourCard as Tour } from "@/lib/types";

/** A destination or an activity: introduction, highlights and best season, then the trips that include it. */
export function PlacePage({ place, kind, lang, dict, tours }: {
  place: Place;
  kind: "destination" | "activity";
  lang: Locale;
  dict: Dictionary;
  tours: Tour[];
}) {
  const text = place.text[lang];
  const words = explore[lang];
  const base = kind === "destination" ? "/destinations" : "/activities";
  const url = `${site.url}${localePath(lang, `${base}/${place.slug}`)}`;
  const index = localePath(lang, "/destinations");

  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": kind === "destination" ? "TouristDestination" : "WebPage",
      name: text.name,
      description: text.description,
      url,
      image: `${TRIPS}/${place.image}`,
      ...(tours.length > 0
        ? { hasPart: { "@type": "ItemList", itemListElement: tours.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: `${site.url}${localePath(lang, t.path)}` })) } }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.trip.home, item: `${site.url}${localePath(lang, "/")}` },
        { "@type": "ListItem", position: 2, name: words.title, item: `${site.url}${index}` },
        { "@type": "ListItem", position: 3, name: text.name, item: url },
      ],
    },
  ]).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={`${TRIPS}/${place.image}`} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10">
          <nav aria-label="Breadcrumb" className="mono text-white/55">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href={localePath(lang, "/")} className="hover:text-white">{dict.trip.home}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={kind === "destination" ? index : `${index}#activities`} className="hover:text-white">{kind === "destination" ? words.destinations : words.activities}</Link></li>
            </ol>
          </nav>
          <p className="mono mt-6 text-gold-light">{kind === "destination" ? words.destination : words.activity} · {text.name}</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{text.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{text.lead}</p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-12">
          <div className="space-y-5 text-lg leading-relaxed text-ink lg:col-span-7">
            {text.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-sm border border-line bg-white p-6">
              <h2 className="eyebrow">{words.highlights}</h2>
              <ul className="mt-4 space-y-3">
                {text.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-ink">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-sm border border-line bg-white p-6">
              <h2 className="eyebrow">{words.bestTime}</h2>
              <p className="mt-3 leading-relaxed text-ink">{text.bestTime}</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <h2 className="heading text-[clamp(1.6rem,3vw,2.4rem)]">{kind === "destination" ? words.tripsThere : words.tripsActivity}</h2>
        {tours.length > 0 ? (
          <PagedGrid
            perPage={12}
            dict={dict.trips}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            items={tours.map((t) => (
              <li key={t.id}>
                <TourCard tour={t} lang={lang} dict={dict.tours} />
              </li>
            ))}
          />
        ) : (
          <p className="mt-4 text-muted">{words.noTrips}</p>
        )}
      </section>

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
