"use client";

import { useActionState, useState } from "react";
import { changeBookingStatus, saveBookingNotes, updateBooking } from "@/app/admin/actions";
import { Field, FormMessage, Submit, TextArea, inputClass } from "@/components/admin/form";
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
  confirmed: "Availability and price agreed with the customer.",
  paid: "Deposit or full payment received.",
  completed: "The trip has taken place.",
  cancelled: "The customer or the team cancelled.",
};

export function BookingStatusActions({ reference, current, next }: { reference: string; current: BookingStatus; next: BookingStatus[] }) {
  const [state, action] = useActionState<ActionState, FormData>(changeBookingStatus.bind(null, reference), { status: "idle" });
  const [choice, setChoice] = useState<BookingStatus | null>(null);

  if (next.length === 0) return <p className="text-sm text-muted">This booking is {current}: no further step.</p>;

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-2">
        {next.map((s) => (
          <label key={s} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors ${choice === s ? "border-navy bg-cream" : "border-line hover:border-navy/40"}`}>
            <input type="radio" name="status" value={s} checked={choice === s} onChange={() => setChoice(s)} className="mt-0.5 accent-[var(--navy)]" />
            <span>
              <span className={`block font-semibold ${s === "cancelled" ? "text-sahara" : "text-navy"}`}>{LABEL[s]}</span>
              {HINT[s] && <span className="block text-xs text-muted">{HINT[s]}</span>}
            </span>
          </label>
        ))}
      </div>
      {choice && (
        <>
          <label className="block text-sm">
            <span className="font-medium text-navy">Note (optional)</span>
            <input name="note" maxLength={500} placeholder={choice === "cancelled" ? "Reason" : "e.g. guide and riad booked"} className={inputClass} />
          </label>
          <div className="flex items-center gap-3">
            <Submit className={choice === "cancelled" ? "!bg-sahara" : ""}>{LABEL[choice]}</Submit>
            <FormMessage state={state} />
          </div>
        </>
      )}
      {!choice && <FormMessage state={state} />}
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
