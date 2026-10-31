"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge, money } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/form";
import type { TourRow } from "@/lib/admin/types";

const PER_PAGE = 20;
const CATEGORY: Record<string, string> = {
  "treks.toubkal": "Toubkal",
  "treks.atlas-valleys-villages": "Atlas valleys",
  "treks.regional-treks": "Regional treks",
  "sahara-desert-tours": "Sahara",
  "morocco-tours": "Morocco tours",
  "day-trips-from-marrakech": "Day trips",
};
const DURATIONS = [
  { value: "1", label: "1 day", test: (d: number) => d === 1 },
  { value: "2-4", label: "2–4 days", test: (d: number) => d >= 2 && d <= 4 },
  { value: "5-8", label: "5–8 days", test: (d: number) => d >= 5 && d <= 8 },
  { value: "9+", label: "9+ days", test: (d: number) => d >= 9 },
];
const SORTS = {
  order: { label: "List order", fn: (a: TourRow, b: TourRow) => a.sort_order - b.sort_order || a.id - b.id },
  title: { label: "Title A–Z", fn: (a: TourRow, b: TourRow) => (a.title ?? "").localeCompare(b.title ?? "") },
  priceAsc: { label: "Price ↑", fn: (a: TourRow, b: TourRow) => (a.from_price ?? Infinity) - (b.from_price ?? Infinity) },
  priceDesc: { label: "Price ↓", fn: (a: TourRow, b: TourRow) => (b.from_price ?? -1) - (a.from_price ?? -1) },
  updated: { label: "Recently edited", fn: (a: TourRow, b: TourRow) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "") },
} as const;
type SortKey = keyof typeof SORTS;

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Every trip is loaded once; search, filters, order and pages all work in the browser, instantly.
 * Opening a trip prefetches its page on hover, so the editor appears quickly.
 */
export function TripsTable({ trips }: { trips: TourRow[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [extra, setExtra] = useState("");
  const [sort, setSort] = useState<SortKey>("order");
  const [page, setPage] = useState(1);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean);
    return trips
      .filter((t) => !status || t.status === status)
      .filter((t) => !category || t.category === category)
      .filter((t) => !duration || (t.duration_days !== null && DURATIONS.find((d) => d.value === duration)!.test(t.duration_days)))
      .filter((t) => !price || (price === "on_request" ? t.price_mode === "on_request" : t.price_mode === "tiers"))
      .filter((t) => !extra || (extra === "featured" ? t.is_featured : extra === "photos" ? t.photos < 6 : extra === "nodifficulty" ? !t.difficulty : true))
      .filter((t) => words.every((w) => fold(`${t.title ?? ""} ${CATEGORY[t.category ?? ""] ?? t.category ?? ""} #${t.id}`).includes(w)))
      .sort(SORTS[sort].fn);
  }, [trips, q, status, category, duration, price, extra, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const counts = { published: 0, draft: 0, archived: 0 } as Record<string, number>;
  trips.forEach((t) => (counts[t.status] = (counts[t.status] ?? 0) + 1));
  const any = q || status || category || duration || price || extra;
  const select = `${inputClass} mt-0 !py-2`;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-white p-3 md:p-4">
        <input type="search" value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Search by title, category or #id" aria-label="Search trips"
          className={`${inputClass} mt-0`} />
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          <select aria-label="Status" value={status} onChange={(e) => reset(setStatus)(e.target.value)} className={select}>
            <option value="">All statuses ({trips.length})</option>
            <option value="published">Online ({counts.published})</option>
            <option value="draft">Draft ({counts.draft})</option>
            <option value="archived">Archived ({counts.archived})</option>
          </select>
          <select aria-label="Category" value={category} onChange={(e) => reset(setCategory)(e.target.value)} className={select}>
            <option value="">All categories</option>
            {Object.entries(CATEGORY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select aria-label="Duration" value={duration} onChange={(e) => reset(setDuration)(e.target.value)} className={select}>
            <option value="">Any duration</option>
            {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select aria-label="Price" value={price} onChange={(e) => reset(setPrice)(e.target.value)} className={select}>
            <option value="">Any price</option>
            <option value="tiers">With prices</option>
            <option value="on_request">On request</option>
          </select>
          <select aria-label="More" value={extra} onChange={(e) => reset(setExtra)(e.target.value)} className={select}>
            <option value="">More filters</option>
            <option value="featured">Featured on home</option>
            <option value="photos">Fewer than 6 photos</option>
            <option value="nodifficulty">No difficulty set</option>
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => reset(setSort)(e.target.value as SortKey)} className={select}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-muted"><span className="font-semibold text-navy">{filtered.length}</span> of {trips.length} trips</p>
          {any && (
            <button type="button" onClick={() => { setQ(""); setStatus(""); setCategory(""); setDuration(""); setPrice(""); setExtra(""); setPage(1); }}
              className="font-semibold text-gold hover:underline">Clear filters</button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-muted">No trip matches these filters.</p>
      ) : (
        <ul className="grid gap-2.5 lg:grid-cols-2">
          {visible.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/trips/${t.id}`} prefetch className="flex gap-3 rounded-lg border border-line bg-white p-3 transition-colors hover:border-navy/40">
                <span className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-sand">
                  {t.hero && <Image src={t.hero} alt="" fill sizes="96px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 font-semibold leading-snug text-navy">{t.title}</span>
                    <StatusBadge status={t.status} kind="tour" />
                  </span>
                  <span className="mono mt-1 block text-[0.7rem] text-muted">
                    #{t.id} · {CATEGORY[t.category ?? ""] ?? t.category} · {t.duration_days ? `${t.duration_days} d` : "—"} · {t.price_mode === "tiers" ? `from ${money(t.from_price, t.currency)}` : "on request"}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5 text-[0.7rem] font-semibold">
                    {t.is_featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-gold">Featured</span>}
                    <span className={`rounded-full px-2 py-0.5 ${t.photos < 6 ? "bg-sahara/10 text-sahara" : "bg-sand text-navy"}`}>{t.photos} photos</span>
                    {t.difficulty && <span className="rounded-full bg-sand px-2 py-0.5 capitalize text-navy">{t.difficulty}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-center gap-2 text-sm">
          <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-md border border-line bg-white px-3 py-2 font-semibold text-navy disabled:opacity-40">‹ Previous</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} type="button" onClick={() => setPage(p)} aria-current={p === current ? "page" : undefined}
              className={`h-9 min-w-9 rounded-md border px-2 font-semibold ${p === current ? "border-navy bg-navy text-white" : "border-line bg-white text-navy"}`}>{p}</button>
          ))}
          <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded-md border border-line bg-white px-3 py-2 font-semibold text-navy disabled:opacity-40">Next ›</button>
        </nav>
      )}
    </div>
  );
}
