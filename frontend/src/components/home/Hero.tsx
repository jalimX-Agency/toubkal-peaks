import Link from "next/link";
import { HeroPhoto } from "@/components/home/HeroPhoto";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos } from "@/lib/site";

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary["hero"] }) {
  return (
    <section className="mx-auto grid max-w-[1400px] gap-10 px-5 pb-10 pt-24 md:px-10 lg:min-h-[100svh] lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-12 lg:pt-28">
      <div className="relative z-10 lg:col-span-5 lg:pb-6">
        <p className="mono text-terracotta">{dict.eyebrow}</p>

        <h1 className="display mt-5 text-[clamp(4.6rem,14vw,11rem)]">
          <span className="block">{dict.line1}</span>
          <span className="block pl-[0.5em] text-terracotta">{dict.line2}</span>
          <span className="block">{dict.line3}</span>
        </h1>

        <p className="mt-8 max-w-md text-[1.15rem] leading-relaxed text-ink-soft">{dict.lead}</p>

        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href={localePath(lang, "/treks")}
            className="mono group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-paper transition-colors hover:bg-terracotta"
          >
            {dict.primary}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href={localePath(lang, "/day-trips-from-marrakech")}
            className="mono border-b border-ink/40 pb-1 text-ink transition-colors hover:border-terracotta hover:text-terracotta"
          >
            {dict.secondary}
          </Link>
        </div>

        <ul className="mono mt-12 flex flex-wrap gap-x-5 gap-y-2 text-ink-soft">
          {dict.badges.map((badge) => (
            <li key={badge} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rotate-45 bg-terracotta" aria-hidden="true" />
              {badge}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-7">
        <HeroPhoto {...photos.village} alt={dict.photoAlt} caption={dict.caption} />
      </div>
    </section>
  );
}
