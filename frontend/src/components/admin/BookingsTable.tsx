"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { bulkBookings } from "@/app/admin/actions";
import { Ago } from "@/components/admin/Ago";
import { FormMessage } from "@/components/admin/form";
import { StatusBadge, day, money } from "@/components/admin/ui";
import type { ActionState, BookingSummary } from "@/lib/admin/types";

const ACTIONS = {
  complete: { label: "Mark completed", confirm: "Mark {n} as completed (the trip has taken place)?" },
  cancel: { label: "Cancel", confirm: "Cancel {n}?" },
  delete: { label: "Delete", confirm: "Delete {n}? They disappear from the lists." },
} as const;
type Action = keyof typeof ACTIONS;

/**
 * The bookings of the current page: tick some (or all) to act on them together; a row opens the
 * booking in the side panel. `query` is the list's current filters, kept when a booking is opened.
 */
export function BookingsTable({ rows, query }: { rows: BookingSummary[]; query: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();
  // a row that left the list (filtered out, deleted) is no longer selected
  const ticked = selected.filter((r) => rows.some((b) => b.reference === r));
  const all = rows.length > 0 && ticked.length === rows.length;
  const open = (reference: string) => `/admin/bookings?${new URLSearchParams([...new URLSearchParams(query), ["open", reference]])}`;

  const toggle = (reference: string) => setSelected((s) => (s.includes(reference) ? s.filter((r) => r !== reference) : [...s, reference]));
  const toggleAll = () => setSelected(all ? [] : rows.map((b) => b.reference));

  const run = (action: Action) => {
    const n = `${ticked.length} ${ticked.length === 1 ? "booking" : "bookings"}`;
    if (!confirm(ACTIONS[action].confirm.replace("{n}", n))) return;
    start(async () => {
      const result = await bulkBookings(action, ticked);
      setState(result);
      setSelected([]);
    });
  };

  const box = "h-4 w-4 cursor-pointer rounded border-line accent-[var(--navy)]";

  return (
    <>
      {state.status !== "idle" && <div className="rounded-md border border-line bg-white px-4 py-2.5"><FormMessage state={state} /></div>}

      {/* phones: cards */}
      <ul className="space-y-2.5 md:hidden">
        {rows.map((b) => (
          <li key={b.reference} className={`flex gap-3 rounded-lg border bg-white p-4 ${ticked.includes(b.reference) ? "border-navy" : "border-line"}`}>
            <input type="checkbox" checked={ticked.includes(b.reference)} onChange={() => toggle(b.reference)} aria-label={`Select ${b.name}`} className={`${box} mt-1 shrink-0`} />
            <Link href={open(b.reference)} scroll={false} className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{b.name}</p>
                  <p className="truncate text-sm text-muted">{b.tour_title ?? "Tailor-made trip"}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="mono mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-muted">
                <span>{day(b.start_date)}</span>
                <span>{b.adults + b.children} pax</span>
                <span>{money(b.total_price, b.currency)}</span>
                <span className="ml-auto"><Ago iso={b.created_at} /></span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* tablet and desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={all} onChange={toggleAll} aria-label="Select all bookings on this page" className={box}
                  ref={(el) => { if (el) el.indeterminate = ticked.length > 0 && !all; }} />
              </th>
              <th className="px-3 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Trip</th>
              <th className="px-3 py-3 font-semibold">Departure</th>
              <th className="hidden px-3 py-3 text-right font-semibold lg:table-cell">Pax</th>
              <th className="px-3 py-3 text-right font-semibold">Estimate</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="hidden px-4 py-3 text-right font-semibold lg:table-cell">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((b) => {
              const on = ticked.includes(b.reference);
              return (
                <tr key={b.reference} className={`relative transition-colors ${on ? "bg-navy/[0.04]" : "hover:bg-cream"}`}>
                  {/* above the row's link, so ticking does not open the booking */}
                  <td className="relative z-10 px-4 py-3">
                    <input type="checkbox" checked={on} onChange={() => toggle(b.reference)} aria-label={`Select ${b.name}`} className={box} />
                  </td>
                  <td className="max-w-56 px-3 py-3">
                    <Link href={open(b.reference)} scroll={false} className="block truncate font-semibold text-navy after:absolute after:inset-0">{b.name}</Link>
                    <p className="mono truncate whitespace-nowrap text-[0.7rem] text-muted">{b.reference} · {b.locale.toUpperCase()}</p>
                  </td>
                  <td className="max-w-44 truncate px-3 py-3 text-ink xl:max-w-72">{b.tour_title ?? <span className="text-muted">Tailor-made</span>}</td>
                  <td className="whitespace-nowrap px-3 py-3">{day(b.start_date)}</td>
                  <td className="hidden px-3 py-3 text-right tabular-nums lg:table-cell">{b.adults + b.children}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{money(b.total_price, b.currency)}</td>
                  <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-right text-muted lg:table-cell"><Ago iso={b.created_at} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* actions on the ticked bookings */}
      {ticked.length > 0 && (
        <div className="sticky bottom-3 z-20 mx-auto flex max-w-3xl flex-wrap items-center gap-2 rounded-xl bg-navy-deep p-2.5 pl-4 text-sm text-white shadow-2xl">
          <span className="mr-auto font-semibold">{ticked.length} selected</span>
          <label className="mr-1 flex items-center gap-2 text-white/80 md:hidden">
            <input type="checkbox" checked={all} onChange={toggleAll} className={box} /> All
          </label>
          <button type="button" disabled={pending} onClick={() => run("complete")} className="rounded-md bg-white/10 px-3 py-2 font-semibold hover:bg-white/20 disabled:opacity-50">{ACTIONS.complete.label}</button>
          <button type="button" disabled={pending} onClick={() => run("cancel")} className="rounded-md bg-white/10 px-3 py-2 font-semibold hover:bg-white/20 disabled:opacity-50">{ACTIONS.cancel.label}</button>
          <button type="button" disabled={pending} onClick={() => run("delete")} className="rounded-md bg-sahara px-3 py-2 font-semibold hover:opacity-90 disabled:opacity-50">{pending ? "Working…" : ACTIONS.delete.label}</button>
          <button type="button" onClick={() => setSelected([])} aria-label="Clear the selection" className="rounded-md px-2 py-2 text-white/70 hover:text-white">✕</button>
        </div>
      )}
    </>
  );
}
