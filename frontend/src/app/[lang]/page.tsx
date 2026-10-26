import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TourCard } from "@/components/TourCard";
import { CtaBand } from "@/components/home/CtaBand";
import { TopoHero } from "@/components/home/TopoHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Pillars, type PillarKey } from "@/components/home/Pillars";
import { RiadBand } from "@/components/home/RiadBand";
import { Testimonials } from "@/components/home/Testimonials";
import { TourExplorer } from "@/components/home/TourExplorer";
import { TrustStrip } from "@/components/home/TrustStrip";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getReviews, getTours } from "@/lib/api";
import { media, site } from "@/lib/site";
import type { TourCard as Tour } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDescription,
    alternates: {
      canonical: localePath(lang, "/"),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, "/")])), "x-default": "/" },
    },
    openGraph: { title: dict.meta.homeTitle, description: dict.meta.homeDescription, locale: lang, url: localePath(lang, "/") },
  };
}

function pillarOf(tour: Tour): PillarKey {
  const key = tour.category.key;
  if (key.startsWith("treks")) return "treks";
  if (key === "sahara-desert-tours") return "sahara";
  if (key === "day-trips-from-marrakech") return "dayTrips";
  return "cities";
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, tours, reviews] = await Promise.all([getDictionary(lang), getTours({ locale: lang, perPage: 60 }), getReviews(6)]);

  const counts: Record<PillarKey, number> = { treks: 0, sahara: 0, cities: 0, dayTrips: 0 };
  for (const tour of tours.data) counts[pillarOf(tour)]++;

  const cards = Object.fromEntries(tours.data.map((tour) => [tour.id, <TourCard key={tour.id} tour={tour} lang={lang} dict={dict.tours} />]));

  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    logo: media.icon(512),
    image: media.ogImage,
    email: site.email,
    telephone: site.phones[0],
    description: dict.meta.homeDescription,
    address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.country },
    areaServed: "Morocco",
    knowsLanguage: locales,
    ...(reviews.summary.count > 0 && reviews.summary.average
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: reviews.summary.average, reviewCount: reviews.summary.count } }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
      <TopoHero lang={lang} dict={dict.hero} camps={dict.ruler.camps} />
      <TrustStrip dict={dict.trust} tripCount={tours.data.length} />
      <Pillars lang={lang} dict={dict.pillars} counts={counts} />
      <TourExplorer
        lang={lang}
        dict={dict.tours}
        tours={tours.data.map(({ id, category, is_featured }) => ({ id, category, is_featured }))}
        cards={cards}
      />
      <HowItWorks dict={dict.steps} />
      <RiadBand dict={dict.riad} />
      <Testimonials dict={dict.reviews} reviews={reviews.data} summary={reviews.summary} />
      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
