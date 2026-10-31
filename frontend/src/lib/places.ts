import type { Place } from "@/content/destinations";
import type { Locale } from "@/i18n/config";
import { getTours } from "@/lib/api";
import type { TourCard } from "@/lib/types";

/**
 * The trips of a destination or an activity, in the visitor's language. Matching is done on the
 * English list (addresses and titles are written in English there), then the same trips are taken
 * from the language's list, which shares the trip ids.
 */
export async function toursFor(place: Place, lang: Locale): Promise<TourCard[]> {
  const [english, local] = await Promise.all([getTours({ locale: "en", perPage: 100 }), getTours({ locale: lang, perPage: 100 })]);
  const { words, categories } = place.match;
  const ids = new Set(
    english.data
      .filter((t) => (categories?.includes(t.category.key) ?? false) || (words?.test(`${t.slug} ${t.title.toLowerCase()}`) ?? false))
      .map((t) => t.id),
  );
  return local.data.filter((t) => ids.has(t.id));
}
