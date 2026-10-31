import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlacePage } from "@/components/explore/PlacePage";
import { destinationBySlug, destinations } from "@/content/destinations";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { toursFor } from "@/lib/places";
import { TRIPS } from "@/lib/site";

export function generateStaticParams() {
  return destinations.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const place = destinationBySlug(slug);
  if (!hasLocale(lang) || !place) return {};
  const text = place.text[lang];
  const path = `/destinations/${place.slug}`;
  return {
    title: text.title,
    description: text.description,
    alternates: {
      canonical: localePath(lang, path),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])), "x-default": path },
    },
    openGraph: { title: text.title, description: text.description, url: localePath(lang, path), images: [`${TRIPS}/${place.image}`] },
  };
}

export default async function DestinationPage({ params }: PageProps<"/[lang]/destinations/[slug]">) {
  const { lang, slug } = await params;
  const place = destinationBySlug(slug);
  if (!hasLocale(lang) || !place) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), toursFor(place, lang)]);
  return <PlacePage place={place} kind="destination" lang={lang} dict={dict} tours={tours} />;
}
