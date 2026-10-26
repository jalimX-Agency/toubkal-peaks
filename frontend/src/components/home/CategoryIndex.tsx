import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { Reveal } from "@/components/ui/Reveal";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos } from "@/lib/site";
import type { Category } from "@/lib/types";

const ROWS = [
  { dict: "treks", key: "treks", path: "/treks", photo: photos.hikers },
  { dict: "sahara", key: "sahara-desert-tours", path: "/sahara-desert-tours", photo: photos.dunes },
  { dict: "morocco", key: "morocco-tours", path: "/morocco-tours", photo: photos.souk },
  { dict: "dayTrips", key: "day-trips-from-marrakech", path: "/day-trips-from-marrakech", photo: photos.camel },
] as const;

/** The four hubs as a typographic index. On hover a photo of that terrain slides in. */
export function CategoryIndex({ lang, dict, categories }: { lang: Locale; dict: Dictionary["categories"]; categories: Category[] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
      <Reveal>
        <p className="mono text-terracotta">{dict.eyebrow}</p>
        <h2 className="display mt-3 text-[clamp(2.4rem,6vw,4.6rem)]">{dict.title}</h2>
      </Reveal>

      <ol className="mt-12 border-b border-ink/20 md:mt-16">
        {ROWS.map((row, i) => {
          const count = categories.find((c) => c.key === row.key)?.tours_count;
          const item = dict.items[row.dict];
          return (
            <li key={row.key}>
              <Link
                href={localePath(lang, row.path)}
                className="group relative grid grid-cols-12 items-baseline gap-x-4 border-t border-ink/20 py-6 transition-colors hover:bg-paper-2/60 md:py-9"
              >
                <span className="mono col-span-2 text-ink-soft md:col-span-1">0{i + 1}</span>
                <span className="display col-span-10 text-[clamp(2.4rem,6.2vw,5.4rem)] transition-colors group-hover:text-terracotta md:col-span-6">
                  {item.name}
                </span>
                <span className="col-span-10 col-start-3 mt-2 max-w-sm text-ink-soft md:col-span-3 md:col-start-8 md:mt-0">{item.text}</span>
                <span className="mono col-span-12 mt-4 flex items-center justify-between text-ink md:col-span-2 md:mt-0 md:justify-end md:gap-5">
                  {typeof count === "number" && count > 0 ? `${count} ${dict.routes}` : ""}
                  <Arrow className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                </span>

                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[22%] top-1/2 z-10 hidden aspect-[4/3] w-56 -translate-y-1/2 scale-90 overflow-hidden opacity-0 shadow-xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 xl:block"
                >
                  <Image src={row.photo.src} alt="" fill sizes="224px" className="object-cover" />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
