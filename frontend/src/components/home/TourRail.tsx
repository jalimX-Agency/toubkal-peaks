import Link from "next/link";
import { TourCardView } from "@/components/TourCardView";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { TourCard } from "@/lib/types";

/** Horizontal, swipeable row of tour cards (native scroll-snap). */
export function TourRail({ lang, dict, tours }: { lang: Locale; dict: Dictionary["rail"]; tours: TourCard[] }) {
  if (tours.length === 0) return null;

  return (
    <section className="bg-snow py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mono text-terracotta">{dict.eyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2.4rem,6vw,4.6rem)]">{dict.title}</h2>
            <p className="mt-4 text-lg text-ink-soft">{dict.lead}</p>
          </div>
          <Link
            href={localePath(lang, "/treks/toubkal")}
            className="mono group inline-flex items-center gap-3 border-b border-ink pb-1 text-ink transition-colors hover:border-terracotta hover:text-terracotta"
          >
            {dict.all}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>

      <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(1.25rem,calc((100vw-1400px)/2+1.25rem))] pb-6 [scrollbar-width:none] scroll-px-[max(1.25rem,calc((100vw-1400px)/2+1.25rem))] md:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] md:scroll-px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] [&::-webkit-scrollbar]:hidden">
        {tours.map((tour) => (
          <TourCardView key={tour.id} tour={tour} lang={lang} dict={dict} />
        ))}
        <div className="w-5 shrink-0" aria-hidden="true" />
      </div>
    </section>
  );
}
