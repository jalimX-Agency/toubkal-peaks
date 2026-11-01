"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { changeBookingStatus, deleteBooking, saveBookingNotes, updateBooking } from "@/app/admin/actions";
import { announceBookingChange, useFeedback } from "@/components/admin/Feedback";
import { Field, FormMessage, Submit, TextArea, inputClass } from "@/components/admin/form";
import { useClosePanel } from "@/components/admin/SidePanel";
import type { ActionState, BookingDetail, BookingStatus } from "@/lib/admin/types";

const LABEL: Record<BookingStatus, string> = {
  pending: "Back to pending",
  confirmed: "Confirm",
  paid: "Mark as paid",
  completed: "Mark as completed",
  cancelled: "Cancel booking",
};
const HINT: Record<BookingStatus, string> = {
  pending: "",
  confirmed: "Trip available: the customer receives the PayPal link for their deposit.",
  paid: "Deposit or full payment received.",
  completed: "The trip has taken place.",
  cancelled: "The customer or the team cancelled.",
};

export function BookingStatusActions({ reference, current, next, deposit, currency }: { reference: string; current: BookingStatus; next: BookingStatus[]; deposit: number | null; currency: string }) {
  const { optimistic } = useFeedback();
  const [choice, setChoice] = useState<BookingStatus | null>(null);
  const [state, setState] = useState<ActionState>({ status: "idle" });
  // the status shown while the server is still saving it (the list behind the panel shows it too)
  const [saving, setSaving] = useState<BookingStatus | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!choice) return;
    const data = new FormData(e.currentTarget);
    const status = choice;
    const done = await optimistic({
      apply: () => {
        setSaving(status);
        announceBookingChange({ reference, status });
      },
      undo: () => {
        setSaving(null);
        announceBookingChange({ reference, status: "reset" });
      },
      send: async () => {
        const result = await changeBookingStatus(reference, { status: "idle" }, data);
        setState(result);
        return result;
      },
      success: status === "confirmed" ? "Booking confirmed: the customer received the deposit email." : `Booking ${status === "cancelled" ? "cancelled" : `marked as ${status}`}.`,
    });
    setSaving(null);
    if (done) setChoice(null);
  };

  if (saving) {
    return <p role="status" className="text-sm font-semibold text-navy">{LABEL[saving]}… <span className="font-normal text-muted">saving</span></p>;
  }

  if (next.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">This booking is {current}: nothing more to do.</p>
        <FormMessage state={state} />
      </div>
    );
  }

  // the step forward as the main button, the other moves quieter, cancelling as a red link
  const forward = next.filter((s) => s !== "cancelled");
  const main = forward.find((s) => s !== "pending");

  if (!choice) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {forward.map((s) => (
            <button key={s} type="button" onClick={() => setChoice(s)}
              className={`rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${s === main ? "bg-navy text-white hover:bg-navy-deep" : "border border-line bg-white text-navy hover:border-navy"}`}>
              {LABEL[s]}
            </button>
          ))}
          {next.includes("cancelled") && (
            <button type="button" onClick={() => setChoice("cancelled")} className="ml-auto px-2 py-2.5 text-sm font-semibold text-sahara hover:underline">{LABEL.cancelled}</button>
          )}
        </div>
        {main && <p className="text-xs text-muted">{HINT[main]}</p>}
        <FormMessage state={state} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="hidden" name="status" value={choice} />
      <p className={`text-sm font-semibold ${choice === "cancelled" ? "text-sahara" : "text-navy"}`}>
        {LABEL[choice]}
        {HINT[choice] && <span className="block text-xs font-normal text-muted">{HINT[choice]}</span>}
      </p>
      {choice === "confirmed" && (
        <Field label={`Deposit for this customer (${currency})`} name="deposit_amount" type="number" min={0} step="1" required autoFocus
          defaultValue={deposit ?? ""} state={state} hint="Sent with the PayPal link in the confirmation email. 0 = no deposit (the email then just confirms)." />
      )}
      <label className="block text-sm">
        <span className="font-medium text-navy">Note (optional)</span>
        <input name="note" maxLength={500} placeholder={choice === "cancelled" ? "Reason" : "e.g. guide and riad booked"} className={inputClass} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={`inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-colors ${choice === "cancelled" ? "bg-sahara hover:opacity-90" : "bg-navy hover:bg-navy-deep"}`}>{LABEL[choice]}</button>
        <button type="button" onClick={() => setChoice(null)} className="text-sm font-semibold text-muted hover:text-navy">Back</button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function BookingNotesForm({ reference, notes }: { reference: string; notes: string | null }) {
  const [state, action] = useActionState<ActionState, FormData>(saveBookingNotes.bind(null, reference), { status: "idle" });
  return (
    <form action={action} className="space-y-3">
      <TextArea label="Only the team sees these notes" name="admin_notes" rows={5} defaultValue={notes ?? ""} maxLength={10000}
        placeholder="Guide, riad, transfers, diet, payments…" state={state} />
      <div className="flex items-center gap-3">
        <Submit>Save notes</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function BookingEditForm({ booking: b }: { booking: BookingDetail }) {
  const [state, action] = useActionState<ActionState, FormData>(updateBooking.bind(null, b.reference), { status: "idle" });
  return (
    <form action={action} className="grid grid-cols-2 gap-3">
      <Field label="First name" name="first_name" defaultValue={b.first_name} required state={state} />
      <Field label="Last name" name="last_name" defaultValue={b.last_name} required state={state} />
      <Field label="Email" name="email" type="email" defaultValue={b.email} required state={state} className="col-span-2 sm:col-span-1" />
      <Field label="Phone" name="phone" type="tel" defaultValue={b.phone ?? ""} state={state} className="col-span-2 sm:col-span-1" />
      <Field label="Country" name="country" defaultValue={b.country ?? ""} state={state} className="col-span-2" />
      <Field label="Departure" name="start_date" type="date" defaultValue={b.start_date ?? ""} state={state} />
      <Field label="Return" name="end_date" type="date" defaultValue={b.end_date ?? ""} state={state} />
      <Field label="Adults" name="adults" type="number" min={1} max={60} defaultValue={b.adults} required state={state} />
      <Field label="Children" name="children" type="number" min={0} max={60} defaultValue={b.children} state={state} />
      <Field label={`Price per person (${b.currency})`} name="price_per_person" type="number" min={0} step="0.01" defaultValue={b.price_per_person ?? ""} state={state} />
      <Field label={`Total (${b.currency})`} name="total_price" type="number" min={0} step="0.01" defaultValue={b.total_price ?? ""} state={state} />
      <Field label={`Deposit (${b.currency})`} name="deposit_amount" type="number" min={0} step="0.01" defaultValue={b.deposit_amount ?? ""} state={state} />
      <Field label={`Paid so far (${b.currency})`} name="paid_amount" type="number" min={0} step="0.01" defaultValue={b.paid_amount} state={state} />
      <div className="col-span-2 flex items-center gap-3 pt-1">
        <Submit>Save details</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Delete, after typing nothing but a clear confirmation; then back to the list (side panel closed). */
export function BookingDelete({ reference, name }: { reference: string; name: string }) {
  const router = useRouter();
  const { confirm, optimistic } = useFeedback();
  const closePanel = useClosePanel();
  const remove = async () => {
    if (!(await confirm({ title: `Delete the booking of ${name}?`, message: `${reference} disappears from the lists.`, confirmLabel: "Delete booking", danger: true }))) return;
    await optimistic({
      // gone from the list and the panel closed at once; if the server refuses, it comes back with a message
      apply: () => {
        announceBookingChange({ reference, status: "deleted" });
        if (closePanel) closePanel();
        else router.replace("/admin/bookings");
      },
      undo: () => announceBookingChange({ reference, status: "reset" }),
      send: () => deleteBooking(reference),
      success: "Booking deleted.",
    });
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="flex-1 text-sm text-muted">Spam, test or duplicate request? Remove it from the lists.</p>
      <button type="button" onClick={remove} className="rounded-md border border-sahara/40 px-4 py-2 text-sm font-semibold text-sahara hover:bg-sahara/5">
        Delete booking
      </button>
    </div>
  );
}
