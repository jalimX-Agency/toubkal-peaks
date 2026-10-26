import Image from "next/image";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDifficulty, formatDuration, formatPrice } from "@/lib/format";
import type { TourCard } from "@/lib/types";

/** Poster-style tour card used in the horizontal rails. */
export function TourCardView({ tour, lang, dict }: { tour: TourCard; lang: Locale; dict: Dictionary["rail"] }) {
  const duration = formatDuration(tour, dict);
  const difficulty = formatDifficulty(tour.difficulty, dict);

  return (
    <Link href={localePath(lang, `/${tour.path}`)} className="group flex w-[78vw] max-w-[360px] shrink-0 snap-start flex-col sm:w-[340px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        {tour.hero && (
          <Image
            src={tour.hero.url}
            alt={tour.hero.alt || tour.title}
            fill
            sizes="(min-width: 640px) 340px, 78vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        {duration && <span className="mono absolute left-3 top-3 bg-paper px-2.5 py-1.5 text-ink">{duration}</span>}
        {tour.max_altitude_m && (
          <span className="mono absolute bottom-3 right-3 bg-ink/85 px-2 py-1 text-paper">{tour.max_altitude_m.toLocaleString("en-US")} m</span>
        )}
      </div>
      <h3 className="mt-4 text-[1.2rem] font-semibold leading-snug transition-colors group-hover:text-terracotta">{tour.title}</h3>
      <div className="mono mt-3 flex items-center justify-between gap-3 text-ink-soft">
        <span>{difficulty}</span>
        <span className="text-ink">
          {tour.from_price !== null ? `${dict.from} ${formatPrice(tour.from_price, tour.currency, lang)}` : dict.onRequest}
        </span>
      </div>
    </Link>
  );
}
