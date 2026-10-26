import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos } from "@/lib/site";

export function TeamBand({ dict }: { dict: Dictionary["team"] }) {
  return (
    <section className="overflow-hidden bg-night text-paper">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-20 md:px-10 md:py-28 lg:grid-cols-12 lg:gap-14">
        <Reveal className="lg:col-span-5">
          <p className="mono text-ochre">{dict.eyebrow}</p>
          <h2 className="display mt-4 text-[clamp(2.4rem,5.6vw,4.4rem)]">{dict.title}</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/75">{dict.text}</p>
        </Reveal>

        <div className="lg:col-span-7">
          <div className="ridge-bottom relative aspect-[16/10] overflow-hidden bg-night">
            <Image
              src={photos.mule.src}
              width={photos.mule.width}
              height={photos.mule.height}
              alt={dict.photoAlt}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
