"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin/types";

/** Form pieces for the admin (client: they read the pending state of their form). */

export const inputClass =
  "mt-1 block w-full rounded-md border border-line bg-white px-3 py-2.5 text-base text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-navy aria-[invalid=true]:border-sahara md:text-sm";

export function Submit({ children, className = "", pendingLabel = "Saving…" }: { children: React.ReactNode; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep disabled:opacity-60 ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "ok") return <p role="status" className="text-sm font-medium text-atlas">✓ {state.message ?? "Saved"}</p>;
  if (state.status === "error") return <p role="alert" className="text-sm font-medium text-sahara">{state.message}</p>;
  return null;
}

export function Field({ label, name, state, hint, className = "", ...input }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; state?: ActionState; hint?: string }) {
  const error = state?.status === "error" ? state.errors?.[name]?.[0] : undefined;
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-navy">{label}</span>
      <input name={name} aria-invalid={Boolean(error)} className={inputClass} {...input} />
      {error ? <span className="mt-1 block text-xs text-sahara">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Select({ label, name, options, state, className = "", ...select }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; options: { value: string; label: string }[]; state?: ActionState }) {
  const error = state?.status === "error" ? state.errors?.[name]?.[0] : undefined;
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-navy">{label}</span>
      <select name={name} aria-invalid={Boolean(error)} className={inputClass} {...select}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="mt-1 block text-xs text-sahara">{error}</span>}
    </label>
  );
}

export function TextArea({ label, name, state, hint, className = "", ...area }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; state?: ActionState; hint?: string }) {
  const error = state?.status === "error" ? state.errors?.[name]?.[0] : undefined;
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-navy">{label}</span>
      <textarea name={name} aria-invalid={Boolean(error)} className={inputClass} {...area} />
      {error ? <span className="mt-1 block text-xs text-sahara">{error}</span> : hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
