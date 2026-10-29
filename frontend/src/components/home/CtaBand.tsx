import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, site, stock, whatsappLink } from "@/lib/site";

/** Closing call to action over the snowy Atlas, with the summit marker as the last waypoint. */
export function CtaBand({ lang, dict, message }: { lang: Locale; dict: Dictionary["cta"]; message: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={stock.atlasSnow.src} alt="" fill sizes="100vw" className="-z-20 object-cover object-[50%_40%]" />
      <div className="absolute inset-0 -z-10 bg-navy-deep/80" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${media.topo})` }} />
      <div className="mx-auto max-w-7xl px-4 py-20 text-white md:px-8 md:py-28">
        <p className="mono flex items-center gap-3 text-gold-light">
          <span aria-hidden="true" className="h-2.5 w-2.5 rotate-45 border border-gold-light" />
          ▲ 4167 m
        </p>
        <h2 className="font-display mt-4 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.1]">{dict.title}</h2>
        <p className="mt-5 max-w-xl leading-relaxed text-white/80">{dict.text}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href={localePath(lang, "/book")} className="btn-gold">
            {dict.primary}
            <Arrow />
          </Link>
          <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
            {dict.whatsapp}
          </a>
        </div>
        <p className="mono mt-8 text-white/60">
          {dict.email} ·{" "}
          <a href={`mailto:${site.email}`} className="normal-case text-white underline-offset-4 hover:underline">
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}
