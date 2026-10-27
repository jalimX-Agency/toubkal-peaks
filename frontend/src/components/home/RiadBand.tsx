import Image from "next/image";
import { Arrow } from "@/components/ui/Arrow";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, photos, site } from "@/lib/site";

/** Riad Berber Towers in Imlil, the client's own base at the foot of Mount Toubkal, shown as a map inset. */
export function RiadBand({ dict }: { dict: Dictionary["riad"] }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.12]" style={{ backgroundImage: `url(${media.topo})` }} />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:gap-14">
        <div className="relative lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={photos.terrace.src} fill alt={dict.photoAlt} sizes="(min-width: 1024px) 700px, 100vw" className="object-cover object-[50%_35%]" />
          </div>
          <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 border-l border-t border-gold-light/70" />
          <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-gold-light/70" />
          <p className="mono absolute bottom-4 left-4 rounded-sm bg-navy-deep/80 px-3 py-1.5 text-gold-light">Imlil ▲ 1740 m</p>
        </div>
        <div className="lg:col-span-5">
          <p className="eyebrow !text-gold-light">{dict.eyebrow}</p>
          <h2 className="font-display mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-tight">{dict.title}</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-white/80">{dict.text}</p>
          <a href={site.riadUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-light mt-8">
            {dict.cta}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
