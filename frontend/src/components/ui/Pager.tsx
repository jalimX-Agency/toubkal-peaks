"use client";

import { useRef, useState, type ReactNode } from "react";

export interface PagerDict {
  prev: string;
  next: string;
  page: string;
  pages: string;
}

/** Page numbers with previous / next. Long lists collapse to first, last and the pages around the current one. */
export function Pager({ page, total, onChange, dict }: { page: number; total: number; onChange: (page: number) => void; dict: PagerDict }) {
  if (total <= 1) return null;
  const shown = [...new Set([1, page - 1, page, page + 1, total])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const button = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors";

  return (
    <nav aria-label={dict.pages} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" disabled={page === 1} onClick={() => onChange(page - 1)} className={`${button} border-line bg-white px-4 text-navy hover:border-navy disabled:opacity-40`}>
        <span aria-hidden="true">‹</span> <span className="ml-1 hidden sm:inline">{dict.prev}</span>
      </button>
      {shown.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - shown[i - 1] > 1 && <span aria-hidden="true" className="text-muted">…</span>}
          <button
            type="button"
            aria-current={p === page ? "page" : undefined}
            aria-label={dict.page.replace("{page}", String(p)).replace("{total}", String(total))}
            onClick={() => onChange(p)}
            className={`${button} ${p === page ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy"}`}
          >
            {p}
          </button>
        </span>
      ))}
      <button type="button" disabled={page === total} onClick={() => onChange(page + 1)} className={`${button} border-line bg-white px-4 text-navy hover:border-navy disabled:opacity-40`}>
        <span className="mr-1 hidden sm:inline">{dict.next}</span> <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
}

/** A grid of server-rendered cards shown a page at a time (the hub pages); scrolls back to the grid's top on change. */
export function PagedGrid({ items, perPage, dict, className }: { items: ReactNode[]; perPage: number; dict: PagerDict; className: string }) {
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const total = Math.ceil(items.length / perPage);
  const go = (p: number) => {
    setPage(p);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-28">
      <ul className={className}>{items.slice((page - 1) * perPage, page * perPage)}</ul>
      <Pager page={page} total={total} onChange={go} dict={dict} />
    </div>
  );
}
