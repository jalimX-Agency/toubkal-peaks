import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { TeamMember } from "@/lib/types";

/** A few faces of the team (managed in the admin), leading to the About page. Hidden while the team is empty. */
export function Guides({ lang, dict, members }: { lang: Locale; dict: Dictionary["guides"]; members: TeamMember[] }) {
  const shown = members.filter((m) => m.photo).slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">{dict.eyebrow}</p>
            <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">{dict.text}</p>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <Link href={localePath(lang, "/about")} className="btn-outline-navy">
              {dict.cta}
              <Arrow />
            </Link>
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((m) => (
            <li key={m.id}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-line">
                <Image src={m.photo!.url} alt={m.photo!.alt || m.name} fill sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw" className="object-cover" />
              </div>
              <p className="mt-3 font-semibold text-navy">{m.name}</p>
              <p className="text-sm text-muted">{m.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
