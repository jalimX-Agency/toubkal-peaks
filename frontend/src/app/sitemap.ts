import type { MetadataRoute } from "next";
import { localePath, locales, type Locale } from "@/i18n/config";
import { activities } from "@/content/activities";
import { destinations } from "@/content/destinations";
import { getBlogPosts, getTours } from "@/lib/api";
import { HUBS } from "@/lib/hubs";
import { site } from "@/lib/site";

/** Pages that exist in every language, with how much they matter for search. */
const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/trips", priority: 0.9 },
  { path: "/book", priority: 0.6 },
  { path: "/about", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
  { path: "/destinations", priority: 0.7 },
  { path: "/toubkal-guide", priority: 0.8 },
  { path: "/blog", priority: 0.7 },
  ...destinations.map((d) => ({ path: `/destinations/${d.slug}`, priority: 0.7 })),
  ...activities.map((a) => ({ path: `/activities/${a.slug}`, priority: 0.6 })),
];

const url = (lang: Locale, path: string) => `${site.url}${localePath(lang, path)}`;
const everyLanguage = (path: (lang: Locale) => string) => Object.fromEntries(locales.map((l) => [l, url(l, path(l))]));

/**
 * Every public page in the four languages, each with its other-language versions (hreflang). A trip
 * is listed in a language only once it is translated: until then that address shows the English text
 * and points search engines to the English page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lists, blogs] = await Promise.all([
    Promise.all(locales.map((lang) => getTours({ locale: lang, perPage: 100 }))),
    Promise.all(locales.map((lang) => getBlogPosts(lang))),
  ]);
  const tripPaths = new Map<number, Partial<Record<Locale, string>>>();
  locales.forEach((lang, i) => {
    for (const tour of lists[i].data) {
      if (tour.locale !== lang) continue;
      tripPaths.set(tour.id, { ...tripPaths.get(tour.id), [lang]: tour.path });
    }
  });

  const fixed = [...PAGES, ...HUBS.map((h) => ({ path: `/${h.path}`, priority: 0.8 }))].flatMap(({ path, priority }) =>
    locales.map((lang) => ({
      url: url(lang, path),
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages: everyLanguage(() => path) },
    })),
  );

  const trips = [...tripPaths.values()].flatMap((paths) => {
    const languages = Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, url(l as Locale, p!)]));
    return Object.entries(paths).map(([lang, path]) => ({
      url: url(lang as Locale, path!),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages },
    }));
  });

  // articles, like trips, only in the languages they are written in
  const articlePaths = new Map<string, Partial<Record<Locale, string>>>();
  const published = new Map<string, string>();
  locales.forEach((lang, i) => {
    for (const post of blogs[i]) {
      if (post.locale === lang) articlePaths.set(post.slug, { ...articlePaths.get(post.slug), [lang]: `/blog/${post.slug}` });
      published.set(post.slug, post.published_at);
    }
  });
  const articles = [...articlePaths.entries()].flatMap(([slug, paths]) => {
    const languages = Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, url(l as Locale, p!)]));
    return Object.entries(paths).map(([lang, path]) => ({
      url: url(lang as Locale, path!),
      lastModified: published.get(slug),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages },
    }));
  });

  return [...fixed, ...trips, ...articles];
}
