import Link from "next/link";
import { TourCard } from "@/components/TourCard";
import { CtaBand } from "@/components/home/CtaBand";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { HUBS, type Hub } from "@/lib/hubs";
import { media, site } from "@/lib/site";
import type { TourCard as Tour } from "@/lib/types";

/** A category of trips (Treks, Sahara, ...): title and introduction, sub-sections for treks, then every trip in it. */
export function HubPage({ hub, lang, dict, tours }: { hub: Hub; lang: Locale; dict: Dictionary; tours: Tour[] }) {
  const { title, intro } = dict.hubs[hub.key];
  const family = HUBS.filter((h) => h.key === "treks" || h.parent === "treks");
  const isTreks = hub.key === "treks" || hub.parent === "treks";
  const parent = hub.parent ? HUBS.find((h) => h.key === hub.parent) : null;
  const url = `${site.url}${localePath(lang, hub.path)}`;

  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: intro,
      url,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: tours.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: `${site.url}${localePath(lang, t.path)}` })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: dict.trip.home, item: `${site.url}${localePath(lang, "/")}` },
        ...(parent ? [{ "@type": "ListItem", position: 2, name: dict.hubs[parent.key].title, item: `${site.url}${localePath(lang, parent.path)}` }] : []),
        { "@type": "ListItem", position: parent ? 3 : 2, name: title, item: url },
      ],
    },
  ]).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.16]" style={{ backgroundImage: `url(${media.topo})` }} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10">
          <nav aria-label="Breadcrumb" className="mono text-white/55">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href={localePath(lang, "/")} className="hover:text-white">{dict.trip.home}</Link>
              </li>
              {parent && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={localePath(lang, parent.path)} className="hover:text-white">{dict.hubs[parent.key].title}</Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <p className="mono mt-6 text-gold-light">
            {String(tours.length).padStart(2, "0")} {dict.pillars.trips}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{intro}</p>

          {isTreks && (
            <nav aria-label={title} className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              {family.map((h) => (
                <Link
                  key={h.key}
                  href={localePath(lang, h.path)}
                  aria-current={h.key === hub.key ? "page" : undefined}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    h.key === hub.key ? "border-gold bg-gold text-white" : "border-white/30 text-white hover:border-white"
                  }`}
                >
                  {dict.tours.tabs[h.tab]}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {tours.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tours.map((t) => (
              <li key={t.id}>
                <TourCard tour={t} lang={lang} dict={dict.tours} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">{dict.tours.empty}</p>
        )}
      </section>

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
