"use client";

import { useMemo, useState } from "react";
import { saveTourCategories } from "@/app/admin/actions";
import { useFeedback } from "@/components/admin/Feedback";
import type { TourDetail } from "@/lib/admin/types";

type Option = TourDetail["category_options"][number];
type Choice = { main: string; extra: string[] };

const sameChoice = (a: Choice, b: Choice) => a.main === b.main && a.extra.length === b.extra.length && a.extra.every((k) => b.extra.includes(k));

/**
 * Where a trip appears on the website: tick the pages that list it and pick the main one, which gives the trip
 * its address. A short summary shows the resulting address and pages before anything is saved.
 */
export function TripCategories({ tour }: { tour: TourDetail }) {
  const { optimistic } = useFeedback();
  const options = tour.category_options;
  const initial: Choice = { main: tour.category ?? options[0]?.key ?? "", extra: tour.extra_categories };
  const [saved, setSaved] = useState<Choice>(initial);
  const [choice, setChoice] = useState<Choice>(initial);
  const [pending, setPending] = useState(false);

  const byKey = useMemo(() => new Map(options.map((o) => [o.key, o])), [options]);
  const tops = options.filter((o) => !o.parent);
  const childrenOf = (key: string) => options.filter((o) => o.parent === key);
  const rows: { option: Option; child: boolean }[] = tops.flatMap((t) => [{ option: t, child: false }, ...childrenOf(t.key).map((c) => ({ option: c, child: true }))]);

  const selected = new Set([choice.main, ...choice.extra]);
  // a trip listed in a sub-category also shows on its parent's page
  const automatic = [...selected].flatMap((k) => (byKey.get(k)?.parent && !selected.has(byKey.get(k)!.parent!) ? [byKey.get(k)!.parent!] : []));
  const pages = [...new Set([...selected, ...automatic])].map((k) => ({ key: k, name: byKey.get(k)?.name ?? k, auto: !selected.has(k) }));

  const slug = tour.translations.en?.slug ?? "";
  const mainPath = byKey.get(choice.main)?.path ?? "";
  const oldPath = byKey.get(saved.main)?.path ?? "";
  const dirty = !sameChoice(choice, saved);

  const toggle = (key: string) => {
    if (key === choice.main) return;
    setChoice((c) => ({ ...c, extra: c.extra.includes(key) ? c.extra.filter((k) => k !== key) : [...c.extra, key] }));
  };
  const makeMain = (key: string) => setChoice((c) => ({ main: key, extra: c.extra.filter((k) => k !== key) }));

  const save = async () => {
    const before = saved;
    setPending(true);
    await optimistic({
      apply: () => setSaved(choice),
      undo: () => setSaved(before),
      send: () => saveTourCategories(tour.id, choice.main, choice.extra),
      success: "Categories saved",
    });
    setPending(false);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="heading text-lg">Where this trip appears</h2>
        <p className="mt-1 text-sm text-muted">
          Tick the pages that list this trip. The <strong className="font-semibold text-navy">main</strong> page gives the trip its web address; the others only show it in their list.
        </p>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-white" aria-label="Categories">
        {rows.map(({ option, child }) => {
          const isMain = option.key === choice.main;
          const on = selected.has(option.key);
          return (
            <li key={option.key} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${child ? "pl-8 sm:pl-10" : ""} ${on ? "bg-cream" : ""}`}>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Show this trip in ${option.name}`}
                disabled={isMain}
                onClick={() => toggle(option.key)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-navy" : "bg-line"} ${isMain ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
              </button>
              <button type="button" onClick={() => toggle(option.key)} disabled={isMain} className="min-w-0 flex-1 text-left disabled:cursor-default">
                <span className={`block text-sm ${child ? "" : "font-semibold"} text-navy`}>{option.name}</span>
                <span className="mono block truncate text-xs text-muted">{option.path}</span>
              </button>
              {isMain ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy" title="The trip's address starts with this category">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7-6.3-3.6-6.3 3.6 1.5-7L2 9.3l7-.8z" /></svg>
                  Main
                </span>
              ) : (
                <button type="button" onClick={() => makeMain(option.key)} className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-muted transition-colors hover:border-navy hover:text-navy">
                  Make main
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="rounded-lg border border-line bg-white p-4 text-sm">
        <p className="mono text-gold">Result</p>
        <dl className="mt-3 space-y-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Web address</dt>
            <dd className="mono mt-1 break-all text-navy">{mainPath}/{slug}</dd>
            {choice.main !== saved.main && (
              <dd className="mt-1 text-xs text-sahara">The address changes: the old one ({oldPath}/{slug}) will redirect to the new one.</dd>
            )}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Listed on</dt>
            <dd className="mt-1.5 flex flex-wrap gap-2">
              {pages.map((p) => (
                <span key={p.key} className={`rounded-full border px-3 py-1 text-xs font-semibold ${p.auto ? "border-dashed border-line text-muted" : "border-navy/20 bg-cream text-navy"}`}>
                  {p.name}{p.auto ? " (automatic)" : ""}
                </span>
              ))}
            </dd>
            <dd className="mt-2 text-xs text-muted">Also on the page of every trip type that includes these categories: all trips, the filters, the home page tabs and the destination and activity pages.</dd>
          </div>
        </dl>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={!dirty || pending} className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:opacity-50">
          {pending ? "Saving…" : "Save categories"}
        </button>
        {dirty && !pending && (
          <button type="button" onClick={() => setChoice(saved)} className="text-sm font-semibold text-muted hover:text-navy">
            Undo changes
          </button>
        )}
      </div>
    </div>
  );
}
