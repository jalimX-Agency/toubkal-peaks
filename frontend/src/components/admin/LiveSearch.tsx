"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { inputClass } from "@/components/admin/form";

type Menu = { param: string; label: string; options: { value: string; label: string }[] };

/**
 * Search box that filters as you type (0.3 s after the last key), keeping the other filters of the
 * address and going back to page 1. Optional menus (filters, sort, per page), applied at once.
 */
export function LiveSearch({ placeholder, sorts, menus = [] }: { placeholder: string; sorts?: { value: string; label: string }[]; menus?: Menu[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const first = useRef(true);
  const all: Menu[] = [...menus, ...(sorts ? [{ param: "sort", label: "Sort", options: sorts }] : [])];

  const go = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    next.delete("open");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // nothing typed since the address was set: do not navigate (it would close an open side panel)
    if (q.trim() === (params.get("q") ?? "")) return;
    const timer = setTimeout(() => go({ q: q.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- typing only
  }, [q]);

  return (
    <div className="flex flex-col gap-2 lg:flex-row" role="search">
      <div className="relative min-w-0 flex-1">
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputClass} mt-0 pl-9 pr-9`} />
        {pending && <span aria-hidden="true" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line border-t-navy" />}
      </div>
      {all.length > 0 && (
        <div className={`grid gap-2 ${all.length > 2 ? "grid-cols-2 sm:grid-cols-3" : all.length > 1 ? "grid-cols-2" : "grid-cols-1"} lg:flex lg:shrink-0`}>
          {all.map((m) => (
            // inputClass is full width: a grid cell below the search, auto width beside it on large screens
            <select key={m.param} aria-label={m.label} defaultValue={params.get(m.param) ?? ""} onChange={(e) => go({ [m.param]: e.target.value })}
              className={`${inputClass} mt-0 lg:!w-auto`}>
              {m.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
