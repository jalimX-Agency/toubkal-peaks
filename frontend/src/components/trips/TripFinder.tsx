"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { TourCard as Tour } from "@/lib/types";

export type FinderTour = Pick<Tour, "id" | "title" | "summary" | "category" | "duration_days" | "difficulty" | "from_price" | "is_featured">;

type TripsDict = Dictionary["trips"];
type ToursDict = Dictionary["tours"];

/** Trip types, in menu order: the trek sub-categories, then the other hubs. */
const TYPES = [
  { key: "toubkal", category: "treks.toubkal" },
  { key: "atlas", category: "treks.atlas-valleys-villages" },
  { key: "regional", category: "treks.regional-treks" },
  { key: "sahara", category: "sahara-desert-tours" },
  { key: "cities", category: "morocco-tours" },
  { key: "dayTrips", category: "day-trips-from-marrakech" },
] as const;

const DURATIONS = [
  { key: "1", test: (d: number) => d === 1 },
  { key: "2-4", test: (d: number) => d >= 2 && d <= 4 },
  { key: "5-8", test: (d: number) => d >= 5 && d <= 8 },
  { key: "9+", test: (d: number) => d >= 9 },
] as const;

const PRICES = [
  { key: "0-150", test: (p: number | null) => p !== null && p < 150 },
  { key: "150-400", test: (p: number | null) => p !== null && p >= 150 && p < 400 },
  { key: "400-700", test: (p: number | null) => p !== null && p >= 400 && p < 700 },
  { key: "700+", test: (p: number | null) => p !== null && p >= 700 },
  { key: "request", test: (p: number | null) => p === null },
] as const;

const DIFFICULTIES = ["easy", "moderate", "difficult"] as const;
const SORTS = ["recommended", "priceAsc", "priceDesc", "durationAsc", "durationDesc"] as const;
type Sort = (typeof SORTS)[number];

type Group = "type" | "duration" | "price" | "difficulty";
type Filters = Record<Group, string[]>;
const GROUPS: Group[] = ["type", "duration", "price", "difficulty"];

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function matches(tour: FinderTour, group: Group, values: string[]): boolean {
  if (values.length === 0) return true;
  switch (group) {
    case "type":
      return TYPES.some((t) => values.includes(t.key) && tour.category.key === t.category);
    case "duration":
      return tour.duration_days !== null && DURATIONS.some((d) => values.includes(d.key) && d.test(tour.duration_days!));
    case "price":
      return PRICES.some((p) => values.includes(p.key) && p.test(tour.from_price));
    case "difficulty":
      return tour.difficulty !== null && values.includes(tour.difficulty);
  }
}

function readFilters(params: URLSearchParams): Filters {
  const list = (name: string) => (params.get(name) ?? "").split(",").filter(Boolean);
  return { type: list("type"), duration: list("duration"), price: list("price"), difficulty: list("difficulty") };
}

/**
 * Every trip, filtered in the browser (the whole catalogue is a few dozen trips). Filters live in the
 * URL, so a filtered list can be shared or bookmarked. Cards are rendered on the server and passed in.
 * Phones get a search bar and a full-screen filter sheet; from lg the filters sit in a sidebar.
 */
export function TripFinder({
  lang,
  dict,
  toursDict,
  hubTitles,
  tours,
  cards,
}: {
  lang: Locale;
  dict: TripsDict;
  toursDict: ToursDict;
  hubTitles: Record<string, string>;
  tours: FinderTour[];
  cards: Record<number, ReactNode>;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const [filters, setFilters] = useState<Filters>(() => readFilters(params));
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>(() => {
    const s = params.get("sort");
    return (SORTS as readonly string[]).includes(s ?? "") ? (s as Sort) : "recommended";
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  // keep the URL in step with the filters (replaceState: no new history entry per click)
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    for (const g of GROUPS) if (filters[g].length) next.set(g, filters[g].join(","));
    if (sort !== "recommended") next.set("sort", sort);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [filters, query, sort, pathname]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const searched = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    if (words.length === 0) return tours;
    return tours.filter((t) => {
      const text = fold(`${t.title} ${t.summary ?? ""} ${hubTitles[t.category.key] ?? ""}`);
      return words.every((w) => text.includes(w));
    });
  }, [tours, query, hubTitles]);

  const results = useMemo(() => {
    const list = searched.filter((t) => GROUPS.every((g) => matches(t, g, filters[g])));
    const price = (t: FinderTour, missing: number) => t.from_price ?? missing;
    const days = (t: FinderTour) => t.duration_days ?? 99;
    const sorted = [...list];
    if (sort === "priceAsc") sorted.sort((a, b) => price(a, Infinity) - price(b, Infinity));
    if (sort === "priceDesc") sorted.sort((a, b) => price(b, -1) - price(a, -1));
    if (sort === "durationAsc") sorted.sort((a, b) => days(a) - days(b));
    if (sort === "durationDesc") sorted.sort((a, b) => days(b) - days(a));
    if (sort === "recommended") sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    return sorted;
  }, [searched, filters, sort]);

  /** How many trips an option would show, given the search and the other groups' filters. */
  const countFor = (group: Group, value: string) =>
    searched.filter((t) => GROUPS.every((g) => (g === group ? matches(t, g, [value]) : matches(t, g, filters[g])))).length;

  const toggle = (group: Group, value: string) =>
    setFilters((f) => ({ ...f, [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value] }));

  const active = GROUPS.reduce((n, g) => n + filters[g].length, 0);
  const clearAll = () => {
    setFilters({ type: [], duration: [], price: [], difficulty: [] });
    setQuery("");
  };
  const countLabel = (n: number) => (n === 1 ? dict.result : dict.results.replace("{count}", String(n)));

  const options: Record<Group, { key: string; label: string }[]> = {
    type: TYPES.map((t) => ({ key: t.key, label: toursDict.tabs[t.key] })),
    duration: DURATIONS.map((d) => ({ key: d.key, label: dict.durations[d.key] })),
    price: PRICES.map((p) => ({ key: p.key, label: dict.prices[p.key] })),
    difficulty: DIFFICULTIES.map((d) => ({ key: d, label: toursDict.difficulty[d] })),
  };

  const panel = (
    <div className="space-y-8">
      {GROUPS.map((group) => (
        <fieldset key={group}>
          <legend className="mono text-gold">{dict[group]}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {options[group].map((o) => {
              const on = filters[group].includes(o.key);
              const n = countFor(group, o.key);
              return (
                <button
                  key={o.key}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && n === 0}
                  onClick={() => toggle(group, o.key)}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    on ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"
                  }`}
                >
                  {o.label}
                  <span className={`mono text-xs ${on ? "text-white/70" : "text-muted"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );

  const sortSelect = (id: string) => (
    <label htmlFor={id} className="flex items-center gap-2 text-sm">
      <span className="sr-only sm:not-sr-only text-muted">{dict.sort}</span>
      <select
        id={id}
        value={sort}
        onChange={(e) => setSort(e.target.value as Sort)}
        className="min-h-11 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-navy"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>
            {dict.sorts[s]}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12 lg:grid lg:grid-cols-12 lg:gap-10">
      {/* search + filter button: sticky under the header on phones */}
      <div className="sticky top-[4.25rem] z-30 -mx-4 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur md:top-20 md:-mx-8 md:px-8 lg:static lg:col-span-12 lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">{dict.search}</span>
            <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.search}
              className="min-h-11 w-full rounded-full border border-line bg-white py-2 pl-10 pr-4 text-base text-navy placeholder:text-muted focus:border-navy focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-navy bg-navy px-4 text-sm font-semibold text-white lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {dict.filters}
            {active > 0 && <span className="rounded-full bg-gold px-1.5 text-xs text-navy">{active}</span>}
          </button>
        </div>
      </div>

      <aside className="hidden lg:col-span-3 lg:mt-8 lg:block">
        <div className="sticky top-28">
          <div className="flex items-center justify-between">
            <h2 className="heading text-xl">{dict.filters}</h2>
            {(active > 0 || query) && (
              <button type="button" onClick={clearAll} className="text-sm font-semibold text-gold underline-offset-4 hover:underline">
                {dict.clear}
              </button>
            )}
          </div>
          <div className="mt-6">{panel}</div>
        </div>
      </aside>

      <section aria-live="polite" className="mt-6 lg:col-span-9 lg:mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-navy">{countLabel(results.length)}</p>
          {sortSelect("sort-trips")}
        </div>

        {results.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((t) => (
              <li key={t.id}>{cards[t.id]}</li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-sm border border-dashed border-line bg-white p-8 text-center">
            <p className="heading text-xl">{dict.none}</p>
            <p className="mx-auto mt-2 max-w-md text-muted">{dict.noneHint}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={clearAll} className="btn-outline-navy">
                {dict.clear}
              </button>
              <Link href={localePath(lang, "/book")} className="btn-gold">
                {dict.custom}
              </Link>
            </div>
          </div>
        )}
      </section>

      {sheetOpen && (
        <div role="dialog" aria-modal="true" aria-label={dict.filters} className="fixed inset-0 z-[60] flex flex-col bg-cream lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-4">
            <h2 className="heading text-xl">{dict.filters}</h2>
            <button type="button" onClick={() => setSheetOpen(false)} className="-mr-2 p-2 text-navy" aria-label={dict.close}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-6">{panel}</div>
          <div className="flex gap-3 border-t border-line bg-white px-4 py-3">
            <button type="button" onClick={clearAll} className="btn-outline-navy flex-1 !px-4">
              {dict.clear}
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-gold flex-[2] !px-4">
              {dict.show.replace("{count}", String(results.length))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
