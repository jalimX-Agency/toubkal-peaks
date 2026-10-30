import Link from "next/link";
import { CardPhotos } from "@/components/CardPhotos";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDifficulty, formatDuration, formatPrice } from "@/lib/format";
import type { TourCard as Tour } from "@/lib/types";

/** Small summit glyph whose height follows the trip's highest point, on a 0-4167 m scale (Toubkal). */
function AltitudeGauge({ metres }: { metres: number }) {
  const h = 4 + (Math.min(metres, 4167) / 4167) * 16;
  return (
    <svg viewBox="0 0 28 22" className="h-4 w-5 text-gold" aria-hidden="true">
      <line x1="0" x2="28" y1="21" y2="21" stroke="currentColor" strokeOpacity="0.35" />
      <path d={`M2 21 L14 ${21 - h} L26 21`} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Trip card: photo, a map-legend line (duration, difficulty, highest point), title, and the price
 * (or "on request") always visible. The image grows to fill the card when the card is made larger.
 */
export function TourCard({ tour, lang, dict }: { tour: Tour; lang: Locale; dict: Dictionary["tours"] }) {
  const duration = formatDuration(tour, dict);
  const difficulty = formatDifficulty(tour.difficulty, dict);

  const href = localePath(lang, tour.path);
  const images = [tour.hero, ...(tour.photos ?? [])].filter((i) => i !== null);

  return (
    // the title link stretches over the whole card; the photo carousel sits above it with its own controls
    <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(2,46,85,0.12)]">
      {images.length > 0 ? (
        <CardPhotos href={href} title={tour.title} images={images} labels={{ prev: dict.photoPrev, next: dict.photoNext, photo: dict.photoOf }} />
      ) : (
        <div className="aspect-[3/2] w-full flex-1 bg-sand" />
      )}
      <div className="flex flex-col p-4">
        <p className="mono flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
          {duration && <span className="text-navy">{duration}</span>}
          {difficulty && (
            <>
              <span aria-hidden="true">·</span>
              <span>{difficulty}</span>
            </>
          )}
          {tour.max_altitude_m && (
            <span className="ml-auto inline-flex items-center gap-1.5" title={dict.maxAlt}>
              <AltitudeGauge metres={tour.max_altitude_m} />
              <span className="text-navy">{tour.max_altitude_m} m</span>
            </span>
          )}
        </p>
        <h3 className="mb-4 mt-2 line-clamp-2 font-semibold leading-snug text-navy">
          <Link href={href} className="after:absolute after:inset-0">
            {tour.title}
          </Link>
        </h3>
        <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
          {tour.price_mode === "tiers" && tour.from_price ? (
            <p className="text-sm text-muted">
              {dict.from}{" "}
              <span className="text-lg font-semibold text-navy">{formatPrice(tour.from_price, tour.currency, lang)}</span>
              <span className="block text-xs">{dict.perPerson}</span>
            </p>
          ) : (
            <p className="text-sm font-semibold text-navy">{dict.onRequest}</p>
          )}
          <span className="shrink-0 text-sm font-semibold text-gold group-hover:underline">{dict.view}</span>
        </div>
      </div>
    </article>
  );
}
