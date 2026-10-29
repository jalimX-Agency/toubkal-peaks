import Link from "next/link";
import { TourCard } from "@/components/TourCard";
import {
  AltitudeProfile,
  bookHref,
  Facts,
  Gallery,
  Highlights,
  IncludedExcluded,
  Itinerary,
  MobileBookBar,
  Packing,
  PriceCard,
  TripHero,
  Upgrades,
} from "@/components/trip/TripParts";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { hubTitle } from "@/lib/hubs";
import { site } from "@/lib/site";
import type { TourDetail } from "@/lib/types";

function structuredData(tour: TourDetail, lang: Locale, dict: Dictionary, categoryLabel: string) {
  const url = `${site.url}${localePath(lang, tour.path)}`;
  const trip = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.seo.description,
    url,
    image: tour.images.hero?.url,
    touristType: tour.category.key.startsWith("treks") ? "Trekking" : undefined,
    itinerary: tour.itinerary.length
      ? { "@type": "ItemList", itemListElement: tour.itinerary.map((d, i) => ({ "@type": "ListItem", position: i + 1, name: `${dict.trip.day} ${d.day}: ${d.title}` })) }
      : undefined,
    offers:
      tour.pricing.mode === "tiers" && tour.pricing.from_price
        ? { "@type": "Offer", price: tour.pricing.from_price, priceCurrency: tour.pricing.currency, availability: "https://schema.org/InStock", url }
        : undefined,
    provider: { "@type": "TravelAgency", name: site.name, url: site.url, telephone: site.phones[0], email: site.email },
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: dict.trip.home, item: `${site.url}${localePath(lang, "/")}` },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: `${site.url}${localePath(lang, tour.category.path)}` },
      { "@type": "ListItem", position: 3, name: tour.title, item: url },
    ],
  };
  return JSON.stringify([trip, breadcrumbs]).replace(/</g, "\\u003c");
}

/** One trip: hero, content with a sticky price card, a link to the reservation wizard and similar trips. */
export function TripPage({ tour, lang, dict }: { tour: TourDetail; lang: Locale; dict: Dictionary }) {
  const categoryLabel = hubTitle(tour.category.key, dict, tour.category.name);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(tour, lang, dict, categoryLabel) }} />
      <TripHero tour={tour} lang={lang} trip={dict.trip} tours={dict.tours} homeLabel={dict.trip.home} categoryLabel={categoryLabel} />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-12 lg:gap-14">
        <div className="space-y-14 lg:col-span-8">
          <Facts tour={tour} trip={dict.trip} />
          <Highlights tour={tour} trip={dict.trip} />
          <AltitudeProfile tour={tour} trip={dict.trip} camps={dict.ruler.camps} />
          <Itinerary tour={tour} trip={dict.trip} />
          <IncludedExcluded tour={tour} trip={dict.trip} />
          <Upgrades tour={tour} trip={dict.trip} />
          <Packing tour={tour} trip={dict.trip} />
          <Gallery tour={tour} trip={dict.trip} />
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-28">
            <PriceCard tour={tour} lang={lang} trip={dict.trip} />
          </div>
        </aside>
      </div>

      <section id="book" className="scroll-mt-24 bg-sand/60">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-8 md:py-16">
          <div>
            <p className="eyebrow">{dict.booking.eyebrow}</p>
            <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.6rem)]">{dict.booking.title}</h2>
            <p lang={tour.locale} className="mono mt-3 normal-case tracking-normal text-navy">{tour.title}</p>
            <p className="mt-3 max-w-xl text-muted">{dict.booking.text}</p>
          </div>
          <Link href={bookHref(tour, lang)} className="btn-gold shrink-0">
            {dict.trip.request}
            <Arrow />
          </Link>
        </div>
      </section>

      {tour.related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <h2 className="heading text-[clamp(1.6rem,3vw,2.3rem)]">{dict.trip.related}</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tour.related.map((t) => (
              <li key={t.id}>
                <TourCard tour={t} lang={lang} dict={dict.tours} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <MobileBookBar tour={tour} lang={lang} trip={dict.trip} />
    </>
  );
}
