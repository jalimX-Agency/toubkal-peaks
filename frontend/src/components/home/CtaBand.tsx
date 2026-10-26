import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { whatsappLink } from "@/lib/site";

export function CtaBand({ lang, dict }: { lang: Locale; dict: Dictionary["cta"] }) {
  return (
    <section className="bg-terracotta text-paper">
      <Reveal className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <h2 className="display max-w-5xl text-[clamp(3.2rem,10vw,8.4rem)]">{dict.title}</h2>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/85">{dict.text}</p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Link
            href={localePath(lang, "/contact")}
            className="mono group inline-flex items-center gap-3 rounded-full bg-paper px-6 py-3.5 text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {dict.primary}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mono border-b border-paper/60 pb-1 transition-colors hover:border-paper"
          >
            {dict.whatsapp}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
