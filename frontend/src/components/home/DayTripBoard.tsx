import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatPrice } from "@/lib/format";
import type { TourCard } from "@/lib/types";

/** Day trips as a departure board: out in the morning, back by evening. */
export function DayTripBoard({ lang, dict, rail, tours }: { lang: Locale; dict: Dictionary["dayTrips"]; rail: Dictionary["rail"]; tours: TourCard[] }) {
  if (tours.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <Reveal className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mono text-terracotta">{dict.eyebrow}</p>
          <h2 className="display mt-3 max-w-3xl text-[clamp(2.4rem,6vw,4.6rem)]">{dict.title}</h2>
        </div>
        <Link
          href={localePath(lang, "/day-trips-from-marrakech")}
          className="mono group inline-flex items-center gap-3 border-b border-ink pb-1 text-ink transition-colors hover:border-terracotta hover:text-terracotta"
        >
          {dict.all}
          <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>

      <ul className="mt-12 border-b border-ink/20">
        {tours.map((tour) => (
          <li key={tour.id}>
            <Link
              href={localePath(lang, `/${tour.path}`)}
              className="group grid grid-cols-[88px_1fr_auto] items-center gap-4 border-t border-ink/20 py-4 transition-colors hover:bg-paper-2/60 md:grid-cols-[150px_1fr_auto_auto] md:gap-8 md:py-5"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                {tour.hero && <Image src={tour.hero.url} alt="" fill sizes="150px" className="object-cover" />}
              </span>
              <span className="text-[1.05rem] font-semibold leading-snug transition-colors group-hover:text-terracotta md:text-[1.25rem]">{tour.title}</span>
              <span className="mono hidden text-ink-soft md:block">1 {rail.day}</span>
              <span className="mono flex items-center gap-4 text-right text-ink">
                {tour.from_price !== null ? `${rail.from} ${formatPrice(tour.from_price, tour.currency, lang)}` : rail.onRequest}
                <Arrow className="hidden h-4 w-4 transition-transform group-hover:translate-x-1 md:block" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
