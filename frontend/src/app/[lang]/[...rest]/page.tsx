import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HubPage } from "@/components/hub/HubPage";
import { TripPage } from "@/components/trip/TripPage";
import { hasLocale, localePath, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTour, getTours } from "@/lib/api";
import { HUBS, hubByPath } from "@/lib/hubs";

// Hubs are prerendered; each trip renders on its first request, then stays cached.
export const instant = false;

/**
 * Every page below the language root that comes from the catalogue: category hubs (/treks, /treks/toubkal, ...)
 * and trips (/treks/toubkal/2-days-mount-toubkal-trek). Anything else answers 404 inside the site layout.
 *
 * Only the hubs are built ahead: prerendering the ~240 trip pages in every language made a build send hundreds
 * of API requests in a minute, and the host answers bursts with 429. A trip page is built by its first visitor
 * (one or two API calls) and then served from the cache like the others.
 */
export async function generateStaticParams() {
  return locales.flatMap((lang) => HUBS.map((h) => ({ lang, rest: h.path.split("/") })));
}

async function resolve(lang: Locale, rest: string[]) {
  const path = rest.join("/");
  const hub = hubByPath(path);
  if (hub) return { kind: "hub" as const, hub, path };
  if (rest.length < 2) return null;
  const tour = await getTour(rest[rest.length - 1], lang);
  return tour ? { kind: "tour" as const, tour, path } : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[...rest]">): Promise<Metadata> {
  const { lang, rest } = await params;
  if (!hasLocale(lang)) return {};
  const [dict, page] = await Promise.all([getDictionary(lang), resolve(lang, rest)]);
  if (!page) return {};

  if (page.kind === "hub") {
    const { title, intro } = dict.hubs[page.hub.key];
    return {
      title,
      description: intro,
      alternates: {
        canonical: localePath(lang, page.hub.path),
        languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, page.hub.path)])), "x-default": localePath("en", page.hub.path) },
      },
      openGraph: { title, description: intro, url: localePath(lang, page.hub.path) },
    };
  }

  const { tour } = page;
  // until a trip is translated, the other languages show the English text: point search engines at the English page
  const canonical = localePath(tour.locale === lang ? lang : "en", tour.path);
  return {
    title: { absolute: tour.seo.title },
    description: tour.seo.description,
    alternates: {
      canonical,
      languages: Object.fromEntries(tour.alternates.filter((a) => hasLocale(a.locale)).map((a) => [a.locale, localePath(a.locale as Locale, a.path)])),
    },
    openGraph: {
      title: tour.title,
      description: tour.seo.description,
      url: canonical,
      images: tour.images.hero ? [{ url: tour.images.hero.url, alt: tour.images.hero.alt || tour.title }] : undefined,
    },
  };
}

export default async function CataloguePage({ params }: PageProps<"/[lang]/[...rest]">) {
  const { lang, rest } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, page] = await Promise.all([getDictionary(lang), resolve(lang, rest)]);
  if (!page) notFound();

  if (page.kind === "hub") {
    const tours = await getTours({ locale: lang, category: page.hub.key, perPage: 60 });
    return <HubPage hub={page.hub} lang={lang} dict={dict} tours={tours.data} />;
  }

  // a trip reached through an old or wrong category path goes to its real address
  if (page.tour.path !== page.path) permanentRedirect(localePath(lang, page.tour.path));
  return <TripPage tour={page.tour} lang={lang} dict={dict} />;
}
