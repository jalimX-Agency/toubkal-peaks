import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos, stock } from "@/lib/site";

export type PillarKey = "treks" | "sahara" | "cities" | "dayTrips";

const PILLARS: { key: PillarKey; path: string; photo: { src: string }; accent: string; position: string }[] = [
  { key: "treks", path: "/treks", photo: photos.hikers, accent: "bg-atlas", position: "50% 50%" },
  { key: "sahara", path: "/sahara-desert-tours", photo: stock.saharaDunes, accent: "bg-sahara", position: "50% 60%" },
  { key: "cities", path: "/morocco-tours", photo: stock.fesSkyline, accent: "bg-imperial", position: "50% 55%" },
  { key: "dayTrips", path: "/day-trips-from-marrakech", photo: photos.camel, accent: "bg-gold", position: "50% 50%" },
];

/** The four service lines of the business, in the logo's service colours, with live trip counts. */
export function Pillars({ lang, dict, counts }: { lang: Locale; dict: Dictionary["pillars"]; counts: Record<PillarKey, number> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
      <p className="eyebrow">{dict.eyebrow}</p>
      <h2 className="heading mt-2 text-[clamp(1.6rem,3vw,2.3rem)]">{dict.title}</h2>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p) => {
          const item = dict.items[p.key];
          return (
            <li key={p.key}>
              <Link
                href={localePath(lang, p.path)}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(2,46,85,0.06),0_8px_24px_rgba(2,46,85,0.06)] transition-shadow hover:shadow-[0_2px_4px_rgba(2,46,85,0.08),0_16px_36px_rgba(2,46,85,0.12)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={p.photo.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: p.position }}
                  />
                  <span className={`absolute inset-x-0 bottom-0 h-1 ${p.accent}`} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="heading text-lg">{item.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.text}</p>
                  <p className="mt-4 flex items-center justify-between text-sm font-semibold">
                    <span className="text-muted">
                      {counts[p.key] > 0 && (
                        <>
                          <span className="text-navy">{counts[p.key]}</span> {dict.trips}
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-gold">
                      {dict.view}
                      <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
