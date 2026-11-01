"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { ActionState, BookingStatus } from "@/lib/admin/types";

type ConfirmOptions = { title: string; message?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean };
type Toast = { id: number; kind: "ok" | "error"; text: string };

type Feedback = {
  /** Asks in the admin's own dialog (not the browser's); resolves true when the person confirms. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (kind: Toast["kind"], text: string) => void;
  /**
   * Optimistic change: `apply` updates the screen at once, `send` then does the work in the background.
   * If it fails, `undo` puts the screen back and an error message explains why.
   */
  optimistic: (change: { apply: () => void; undo: () => void; send: () => Promise<ActionState>; success?: string }) => Promise<boolean>;
};

const FeedbackContext = createContext<Feedback | null>(null);

/**
 * A change made in one place (a booking's panel) that another place (the list behind it) shows at
 * once, before the server has answered: window events, since the two are in separate parts of the page.
 */
export type BookingChange = { reference: string; status: BookingStatus | "deleted" | "reset" };
export const announceBookingChange = (change: BookingChange) => window.dispatchEvent(new CustomEvent("admin:booking", { detail: change }));
export function onBookingChange(listener: (change: BookingChange) => void) {
  const handler = (e: Event) => listener((e as CustomEvent<BookingChange>).detail);
  window.addEventListener("admin:booking", handler);
  return () => window.removeEventListener("admin:booking", handler);
}

export function useFeedback(): Feedback {
  const value = useContext(FeedbackContext);
  if (!value) throw new Error("useFeedback needs the AdminFeedbackProvider");
  return value;
}

/** Mounted once in the admin frame: the confirmation dialog and the messages in the corner. */
export function AdminFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const router = useRouter();
  const [, startRefresh] = useTransition();

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), kind === "error" ? 8000 : 3500);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })), []);

  const optimistic = useCallback<Feedback["optimistic"]>(async ({ apply, undo, send, success }) => {
    apply();
    let result: ActionState;
    try {
      result = await send();
    } catch {
      result = { status: "error", message: "The connection was lost." };
    }
    if (result.status === "error") {
      undo();
      toast("error", `${result.message} The change was cancelled.`);
      return false;
    }
    // the screen already shows the change: the lists and pages catch up with the server quietly
    startRefresh(() => router.refresh());
    const text = success ?? (result.status === "ok" ? result.message : undefined);
    if (text) toast("ok", text);
    return true;
  }, [toast, router]);

  const value = useMemo(() => ({ confirm, toast, optimistic }), [confirm, toast, optimistic]);
  const answer = (ok: boolean) => {
    dialog?.resolve(ok);
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {dialog && <ConfirmDialog options={dialog} onAnswer={answer} />}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
        {toasts.map((t) => (
          <div key={t.id} role={t.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-xl ${t.kind === "error" ? "bg-sahara" : "bg-navy-deep"}`}>
            <span aria-hidden="true">{t.kind === "error" ? "⚠" : "✓"}</span>
            <span className="flex-1">{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))} className="-mr-1 px-1 text-white/70 hover:text-white">✕</button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

function ConfirmDialog({ options, onAnswer }: { options: ConfirmOptions; onAnswer: (ok: boolean) => void }) {
  const confirmButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onAnswer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onAnswer]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={options.message ? "confirm-text" : undefined}>
      <button type="button" aria-label="Cancel" onClick={() => onAnswer(false)} className="absolute inset-0 cursor-default bg-navy-deep/50 backdrop-blur-[1px]" />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 id="confirm-title" className="font-display text-xl font-semibold text-navy">{options.title}</h2>
        {options.message && <p id="confirm-text" className="mt-2 text-sm leading-relaxed text-muted">{options.message}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => onAnswer(false)} className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-navy hover:border-navy">{options.cancelLabel ?? "Cancel"}</button>
          <button ref={confirmButton} type="button" onClick={() => onAnswer(true)}
            className={`rounded-md px-4 py-2.5 text-sm font-semibold text-white ${options.danger ? "bg-sahara hover:opacity-90" : "bg-navy hover:bg-navy-deep"}`}>
            {options.confirmLabel ?? "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
