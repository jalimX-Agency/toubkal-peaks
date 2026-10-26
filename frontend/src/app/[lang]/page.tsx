import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { CtaBand } from "@/components/home/CtaBand";
import { DayTripBoard } from "@/components/home/DayTripBoard";
import { Hero } from "@/components/home/Hero";
import { RiadBand } from "@/components/home/RiadBand";
import { TeamBand } from "@/components/home/TeamBand";
import { TourRail } from "@/components/home/TourRail";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCategories, getTours } from "@/lib/api";
import { site } from "@/lib/site";

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

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, categories, toubkal, dayTrips] = await Promise.all([
    getDictionary(lang),
    getCategories(lang),
    getTours({ locale: lang, category: "treks.toubkal", perPage: 8 }),
    getTours({ locale: lang, category: "day-trips-from-marrakech", perPage: 6 }),
  ]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    email: site.email,
    telephone: site.phones[0],
    description: dict.meta.homeDescription,
    address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: site.country },
    areaServed: "Morocco",
    knowsLanguage: locales,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
      <Hero lang={lang} dict={dict.hero} />
      <CategoryIndex lang={lang} dict={dict.categories} categories={categories} />
      <TourRail lang={lang} dict={dict.rail} tours={toubkal.data} />
      <TeamBand dict={dict.team} />
      <RiadBand dict={dict.riad} />
      <DayTripBoard lang={lang} dict={dict.dayTrips} rail={dict.rail} tours={dayTrips.data} />
      <CtaBand lang={lang} dict={dict.cta} />
    </>
  );
}
