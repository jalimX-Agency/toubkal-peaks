import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDifficulty, formatDuration, formatPrice } from "@/lib/format";
import type { TourCard as Tour } from "@/lib/types";

/** Trip card: photo, duration and difficulty, title, and the price (or "on request") always visible. */
export function TourCard({ tour, lang, dict }: { tour: Tour; lang: Locale; dict: Dictionary["tours"] }) {
  const duration = formatDuration(tour, dict);
  const difficulty = formatDifficulty(tour.difficulty, dict);

  return (
    <Link
      href={localePath(lang, tour.path)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(2,46,85,0.12)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        {tour.hero && (
          <Image
            src={tour.hero.url}
            alt={tour.hero.alt || tour.title}
            fill
            sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {duration && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy">{duration}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {difficulty && <p className="text-xs font-semibold uppercase tracking-wider text-gold">{difficulty}</p>}
        <h3 className="mb-4 mt-1 line-clamp-2 font-semibold leading-snug text-navy">{tour.title}</h3>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
          {tour.price_mode === "tiers" && tour.from_price ? (
            <p className="text-sm text-muted">
              {dict.from}{" "}
              <span className="text-lg font-bold text-navy">{formatPrice(tour.from_price, tour.currency, lang)}</span>
              <span className="block text-xs">{dict.perPerson}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-navy">{dict.onRequest}</p>
          )}
          <span className="shrink-0 text-sm font-semibold text-gold group-hover:underline">{dict.view}</span>
        </div>
      </div>
    </Link>
  );
}
