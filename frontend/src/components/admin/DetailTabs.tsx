"use client";

import { useState } from "react";

/** Tabs for a detail view: one section at a time instead of a long page of forms. */
export function DetailTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${active === t.id ? "border-gold text-navy" : "border-transparent text-muted hover:text-navy"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {/* every tab stays mounted: switching keeps what was typed in a form */}
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id} className="pt-5">{t.content}</div>
      ))}
    </div>
  );
}
