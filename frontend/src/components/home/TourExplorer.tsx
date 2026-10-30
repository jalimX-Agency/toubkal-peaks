"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { TourCard as Tour } from "@/lib/types";

const TABS = [
  { key: "all", category: null, path: "/trips" },
  { key: "toubkal", category: "treks.toubkal", path: "/treks/toubkal" },
  { key: "atlas", category: "treks.atlas-valleys-villages", path: "/treks/atlas-valleys-villages" },
  { key: "regional", category: "treks.regional-treks", path: "/treks/regional-treks" },
  { key: "sahara", category: "sahara-desert-tours", path: "/sahara-desert-tours" },
  { key: "cities", category: "morocco-tours", path: "/morocco-tours" },
  { key: "dayTrips", category: "day-trips-from-marrakech", path: "/day-trips-from-marrakech" },
] as const;

const VISIBLE = 8;

type Item = Pick<Tour, "id" | "category" | "is_featured">;

/** "All" tab: featured trips first, then one trip per category in turn, so every kind of trip shows up. */
function mixed(tours: Item[]): Item[] {
  const featured = tours.filter((t) => t.is_featured);
  const groups = TABS.flatMap((t) => (t.category ? [tours.filter((tour) => !tour.is_featured && tour.category.key === t.category)] : []));
  const rest: Item[] = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) {
    for (const group of groups) if (group[i]) rest.push(group[i]);
  }
  return [...featured, ...rest];
}

/**
 * Filterable trip grid. Cards are rendered on the server (passed in as nodes, keyed by tour id),
 * this component only decides which ones are shown.
 */
export function TourExplorer({
  lang,
  dict,
  tours,
  cards,
}: {
  lang: Locale;
  dict: Dictionary["tours"];
  tours: Item[];
  cards: Record<number, ReactNode>;
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("all");
  const tab = TABS.find((t) => t.key === active)!;

  const total = tab.category ? tours.filter((t) => t.category.key === tab.category).length : tours.length;
  const tabs = TABS.filter((t) => !t.category || tours.some((tour) => tour.category.key === t.category));
  const shown = (tab.category ? tours.filter((t) => t.category.key === tab.category) : mixed(tours)).slice(0, VISIBLE);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{dict.eyebrow}</p>
            <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
          </div>
          <p className="mono text-muted">
            <span className="text-navy">{String(shown.length).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
          </p>
        </div>

        <div role="tablist" aria-label={dict.title} className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={t.key === active}
              onClick={() => setActive(t.key)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                t.key === active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"
              }`}
            >
              {dict.tabs[t.key]}
            </button>
          ))}
        </div>

        {shown.length > 0 ? (
          // the first trip gets a double cell: one deliberate break in the grid
          <ul role="tabpanel" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((tour, i) => (
              <li key={tour.id} className={i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}>
                {cards[tour.id]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-muted">{dict.empty}</p>
        )}

        <div className="mt-10 text-center">
          <Link href={localePath(lang, tab.path)} className="btn-outline-navy">
            {dict.all}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
