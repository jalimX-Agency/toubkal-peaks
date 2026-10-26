import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos, site } from "@/lib/site";

/** Riad Berber Towers in Imlil, the client's own base at the foot of Mount Toubkal. */
export function RiadBand({ dict }: { dict: Dictionary["riad"] }) {
  return (
    <section className="bg-paper-2">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="ridge-top relative aspect-[4/3.4] overflow-hidden bg-paper">
            <Image
              src={photos.terrace.src}
              width={photos.terrace.width}
              height={photos.terrace.height}
              alt={dict.photoAlt}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="h-full w-full object-cover object-[50%_35%]"
            />
          </div>
        </div>

        <Reveal className="lg:col-span-5 lg:col-start-8">
          <p className="mono text-terracotta">{dict.eyebrow}</p>
          <h2 className="display mt-4 text-[clamp(2.4rem,5.6vw,4.4rem)]">{dict.title}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">{dict.text}</p>
          <a
            href={site.riadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono group mt-9 inline-flex items-center gap-3 border-b border-ink pb-1 text-ink transition-colors hover:border-terracotta hover:text-terracotta"
          >
            {dict.cta}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
