import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos, site, whatsappLink } from "@/lib/site";

export function CtaBand({ lang, dict, message }: { lang: Locale; dict: Dictionary["cta"]; message: string }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Image src={photos.mule.src} alt="" fill sizes="100vw" className="-z-10 object-cover object-[50%_60%]" />
      <div className="absolute inset-0 -z-10 bg-navy-deep/80" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-white md:py-24">
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-semibold leading-tight">{dict.title}</h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/85">{dict.text}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={localePath(lang, "/contact")} className="btn-gold">
            {dict.primary}
            <Arrow />
          </Link>
          <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
            {dict.whatsapp}
          </a>
        </div>
        <p className="mt-6 text-sm text-white/70">
          {dict.email}:{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-white underline-offset-4 hover:underline">
            {site.email}
          </a>
        </p>
      </div>
    </section>
  );
}
