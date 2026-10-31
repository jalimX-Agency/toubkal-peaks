"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { inputClass } from "@/components/admin/form";

/**
 * Search box that filters as you type (0.3 s after the last key), keeping the other filters of the
 * address and going back to page 1. Optional sort menu, applied at once.
 */
export function LiveSearch({ placeholder, sorts }: { placeholder: string; sorts?: { value: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [pending, start] = useTransition();
  const first = useRef(true);

  const go = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => go({ q: q.trim() }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- typing only
  }, [q]);

  return (
    <div className="flex gap-2" role="search">
      <div className="relative min-w-0 flex-1">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} className={`${inputClass} mt-0 pr-9`} />
        {pending && <span aria-hidden="true" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line border-t-navy" />}
      </div>
      {sorts && (
        <select aria-label="Sort" defaultValue={params.get("sort") ?? ""} onChange={(e) => go({ sort: e.target.value })} className={`${inputClass} mt-0 w-auto`}>
          {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      )}
    </div>
  );
}
