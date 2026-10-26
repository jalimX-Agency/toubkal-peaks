import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos, site } from "@/lib/site";

/** Riad Berber Towers in Imlil, the client's own base at the foot of Mount Toubkal. */
export function RiadBand({ dict }: { dict: Dictionary["riad"] }) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={photos.terrace.src}
            fill
            alt={dict.photoAlt}
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover object-[50%_35%]"
          />
        </div>
        <div>
          <p className="eyebrow !text-gold-light">{dict.eyebrow}</p>
          <h2 className="font-display mt-2 text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-tight">{dict.title}</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-white/80">{dict.text}</p>
          <a href={site.riadUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-light mt-7">
            {dict.cta}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
