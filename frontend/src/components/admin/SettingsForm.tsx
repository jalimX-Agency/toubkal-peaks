"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { FormMessage } from "@/components/admin/form";
import type { ActionState } from "@/lib/admin/types";

/** One switch per site option; each change is saved at once. */
export function SettingsForm({ copyProtection }: { copyProtection: boolean }) {
  const [on, setOn] = useState(copyProtection);
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();
  const toggle = () => {
    const next = !on;
    setOn(next);
    start(async () => {
      const result = await saveSettings({ copy_protection: next });
      setState(result);
      if (result.status === "error") setOn(!next);
    });
  };

  return (
    <div className="rounded-lg border border-line bg-white p-4 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="font-semibold text-navy">Copy protection on the website</p>
          <p className="mt-1 text-sm text-muted">
            When on, visitors cannot select or copy the texts, right-click, drag the photos or use the save, print and view-source shortcuts.
            Form fields stay usable. It discourages copying; it cannot stop screenshots.
          </p>
        </div>
        <button type="button" role="switch" aria-checked={on} aria-label="Copy protection" onClick={toggle} disabled={pending}
          className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${on ? "bg-atlas" : "bg-line"}`}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span className={`font-semibold ${on ? "text-atlas" : "text-muted"}`}>{on ? "On" : "Off"}</span>
        <FormMessage state={state} />
      </div>
    </div>
  );
}
