import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlacePage } from "@/components/explore/PlacePage";
import { activities, activityBySlug } from "@/content/activities";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { toursFor } from "@/lib/places";
import { TRIPS } from "@/lib/site";

export function generateStaticParams() {
  return activities.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/activities/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const place = activityBySlug(slug);
  if (!hasLocale(lang) || !place) return {};
  const text = place.text[lang];
  const path = `/activities/${place.slug}`;
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

export default async function ActivityPage({ params }: PageProps<"/[lang]/activities/[slug]">) {
  const { lang, slug } = await params;
  const place = activityBySlug(slug);
  if (!hasLocale(lang) || !place) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), toursFor(place, lang)]);
  return <PlacePage place={place} kind="activity" lang={lang} dict={dict} tours={tours} />;
}
