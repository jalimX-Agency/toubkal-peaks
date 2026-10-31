"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * A panel sliding in from the right over the current list (full screen on phones). The list page
 * opens it with ?open=…; closing goes to `closeHref` (the list with its filters, without the panel)
 * and keeps the scroll. Escape and the backdrop close it.
 */
export function SidePanel({ title, subtitle, badge, fullHref, closeHref, children }: {
  title: string; subtitle?: string; badge?: React.ReactNode; fullHref?: string; closeHref: string; children: React.ReactNode;
}) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = () => router.replace(closeHref, { scroll: false });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router, closeHref]);

  const close = () => router.replace(closeHref, { scroll: false });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={close} className="absolute inset-0 cursor-default bg-navy-deep/40 backdrop-blur-[1px]" />
      <div ref={panel} tabIndex={-1} className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-cream shadow-2xl outline-none md:rounded-l-xl">
        <div className="flex items-start gap-3 border-b border-line bg-white px-4 py-4 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-xl font-semibold text-navy">{title}</p>
            {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          </div>
          {badge}
          {fullHref && <a href={fullHref} className="hidden shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy sm:block">Full page ↗</a>}
          <button type="button" onClick={close} aria-label="Close" className="-mr-1 shrink-0 rounded-md p-1.5 text-navy hover:bg-sand">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/** Shown while a booking loads: the panel opens at once, its content follows. */
export function PanelSkeleton({ closeHref }: { closeHref: string }) {
  return (
    <SidePanel title="Loading…" closeHref={closeHref}>
      <div className="animate-pulse space-y-4 p-4 md:p-6" aria-hidden="true">
        <div className="h-12 rounded bg-white" />
        <div className="h-40 rounded bg-white" />
        <div className="h-64 rounded bg-white" />
      </div>
    </SidePanel>
  );
}
