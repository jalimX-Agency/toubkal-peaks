import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TourCard } from "@/components/TourCard";
import { TripFinder, type FinderTour } from "@/components/trips/TripFinder";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTours } from "@/lib/api";
import { HUBS } from "@/lib/hubs";
import { site, pageHeroes } from "@/lib/site";

const PATH = "/trips";

export async function generateMetadata({ params }: PageProps<"/[lang]/trips">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { trips } = await getDictionary(lang);
  return {
    title: trips.metaTitle,
    description: trips.metaDescription,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/**
 * The whole catalogue on one page, with filters. The category hubs stay: they are the pages built
 * for search engines; this one is for visitors who want to compare everything.
 */
export default async function TripsPage({ params }: PageProps<"/[lang]/trips">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, { data: tours }] = await Promise.all([getDictionary(lang), getTours({ locale: lang, perPage: 100 })]);
  const { trips } = dict;

  const cards = Object.fromEntries(tours.map((t) => [t.id, <TourCard key={t.id} tour={t} lang={lang} dict={dict.tours} />]));
  const finderTours: FinderTour[] = tours.map(({ id, title, summary, category, duration_days, difficulty, from_price, is_featured }) => ({
    id, title, summary, category, duration_days, difficulty, from_price, is_featured,
  }));
  const hubTitles = Object.fromEntries(HUBS.map((h) => [h.key, dict.hubs[h.key].title]));

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: trips.metaTitle,
    description: trips.metaDescription,
    url: `${site.url}${localePath(lang, PATH)}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tours.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.title, url: `${site.url}${localePath(lang, t.path)}` })),
    },
  }).replace(/</g, "\u003c");

  // before the filters load (and for search engines): every trip, unfiltered
  const fallback = (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => (
          <li key={t.id}>{cards[t.id]}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <HeroBackdrop src={pageHeroes.trips} />
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
          <p className="mono text-gold-light">
            {String(tours.length).padStart(2, "0")} · {trips.eyebrow}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{trips.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{trips.lead}</p>
        </div>
      </section>
      <div className="bg-cream">
        <Suspense fallback={fallback}>
          <TripFinder lang={lang} dict={trips} toursDict={dict.tours} hubTitles={hubTitles} tours={finderTours} cards={cards} />
        </Suspense>
      </div>
    </>
  );
}
