import { BookingDelete, BookingEditForm, BookingNotesForm, BookingStatusActions } from "@/components/admin/BookingForms";
import { DetailTabs } from "@/components/admin/DetailTabs";
import { day, money } from "@/components/admin/ui";
import type { BookingDetail, BookingStatus } from "@/lib/admin/types";

const STEPS: { status: BookingStatus; label: string }[] = [
  { status: "pending", label: "Request" },
  { status: "confirmed", label: "Confirmed" },
  { status: "paid", label: "Paid" },
  { status: "completed", label: "Completed" },
];

/**
 * A booking, shared by the full page and the side panel opened from the lists: where it stands and
 * the next step first, then the details in tabs (overview, editing, notes and history).
 */
export function BookingDetailView({ booking: b, inPanel = false }: { booking: BookingDetail; inPanel?: boolean }) {
  const phone = b.phone?.replace(/[^\d+]/g, "") ?? "";
  const greeting = `Hello ${b.first_name}, thank you for your request ${b.reference}${b.tour_title ? ` for "${b.tour_title}"` : ""}.`;
  const mail = `mailto:${b.email}?subject=${encodeURIComponent(`Your trip request ${b.reference}`)}&body=${encodeURIComponent(`${greeting}\n\n`)}`;
  const travellers = `${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? ` + ${b.children} child${b.children > 1 ? "ren" : ""}` : ""}`;

  return (
    <div className={`space-y-4 ${inPanel ? "p-4 md:p-6" : "mx-auto max-w-4xl p-4 md:p-8"}`}>
      {/* where the booking stands */}
      <section className="rounded-lg border border-line bg-white p-4 md:p-5">
        <Progress status={b.status} />
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm sm:grid-cols-4">
          <Fact label="Trip" value={b.tour_title ?? "Tailor-made"} className="col-span-2" />
          <Fact label="Departure" value={b.start_date ? day(b.start_date) : "Not decided"} />
          <Fact label="Travellers" value={travellers} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {phone && <Contact href={`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(greeting)}`} external className="bg-[#25D366] text-white">WhatsApp</Contact>}
          <Contact href={mail} className="bg-navy text-white">Email</Contact>
          {phone && <Contact href={`tel:${phone}`} className="border border-line bg-white text-navy">Call</Contact>}
        </div>
      </section>

      {/* the next step */}
      <section className="rounded-lg border border-gold/40 bg-gold/5 p-4 md:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-navy">Next step</h2>
        <div className="mt-3">
          <BookingStatusActions reference={b.reference} current={b.status} next={b.next_statuses} deposit={b.deposit_amount} currency={b.currency} />
        </div>
      </section>

      <DetailTabs tabs={[
        { id: "overview", label: "Overview", content: <Overview b={b} travellers={travellers} /> },
        {
          id: "edit", label: "Edit details", content: (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-white p-4 md:p-5"><BookingEditForm booking={b} /></div>
              <div className="rounded-lg border border-sahara/30 bg-white p-4 md:p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sahara">Delete</h3>
                <div className="mt-2"><BookingDelete reference={b.reference} name={b.name} /></div>
              </div>
            </div>
          ),
        },
        {
          id: "notes", label: `Notes & history (${b.history.length})`, content: (
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-white p-4 md:p-5"><BookingNotesForm reference={b.reference} notes={b.admin_notes} /></div>
              <div className="rounded-lg border border-line bg-white p-4 md:p-5"><History history={b.history} /></div>
            </div>
          ),
        },
      ]} />
    </div>
  );
}

function Progress({ status }: { status: BookingStatus }) {
  if (status === "cancelled") {
    return <p className="rounded-md bg-sahara/10 px-3 py-2 text-sm font-semibold text-sahara">Cancelled</p>;
  }
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {STEPS.map((s, i) => (
        <li key={s.status} className={`flex items-center gap-2 ${i < STEPS.length - 1 ? "flex-1" : ""}`} aria-current={i === current ? "step" : undefined}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i < current ? "bg-atlas text-white" : i === current ? "bg-navy text-white ring-4 ring-navy/15" : "bg-sand text-muted"}`}>
            {i < current ? "✓" : i + 1}
          </span>
          <span className={`hidden text-xs font-semibold sm:block ${i <= current ? "text-navy" : "text-muted"}`}>{s.label}</span>
          {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded ${i < current ? "bg-atlas" : "bg-line"}`} aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function Overview({ b, travellers }: { b: BookingDetail; travellers: string }) {
  const total = b.total_price ?? 0;
  const paidShare = total > 0 ? Math.min(100, Math.round((b.paid_amount / total) * 100)) : 0;
  const link = "text-navy underline decoration-line underline-offset-2 hover:decoration-navy";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Panel title="Customer">
        <Row label="Name" value={b.name} />
        <Row label="Email" value={<a href={`mailto:${b.email}`} className={link}>{b.email}</a>} />
        <Row label="Phone" value={b.phone ?? "—"} />
        <Row label="Country" value={b.country ?? "—"} />
        <Row label="Language" value={b.locale.toUpperCase()} />
      </Panel>
      <Panel title="Trip">
        <Row label="Trip" value={b.tour_slug ? <a href={`/book?trip=${b.tour_slug}`} target="_blank" rel="noreferrer" className={link}>{b.tour_title} ↗</a> : (b.tour_title ?? "Tailor-made trip")} />
        <Row label="Dates" value={b.start_date ? `${day(b.start_date)}${b.end_date ? ` → ${day(b.end_date)}` : ""}` : "Not decided"} />
        <Row label="Travellers" value={travellers} />
        <Row label="Received" value={`${day(b.created_at)} · ${b.source}`} />
      </Panel>
      <Panel title="Payment" className="md:col-span-2">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Total" value={money(b.total_price, b.currency)} />
          <Fact label="Deposit asked" value={money(b.deposit_amount, b.currency)} />
          <Fact label="Paid" value={money(b.paid_amount, b.currency)} />
          <Fact label="Balance" value={money(b.balance_due, b.currency)} />
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-atlas" style={{ width: `${paidShare}%` }} /></div>
            <p className="mono mt-1 text-[0.7rem] text-muted">{paidShare}% paid</p>
          </div>
        )}
      </Panel>
      {b.special_requests && (
        <Panel title="Message from the customer" className="md:col-span-2">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{b.special_requests}</p>
        </Panel>
      )}
    </div>
  );
}

function History({ history }: { history: BookingDetail["history"] }) {
  return (
    <>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-navy">History</h3>
      <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
        {[...history].reverse().map((h, i) => (
          <li key={i} className="relative text-sm">
            <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
            <p className="font-medium capitalize text-navy">{h.from ? `${h.from} → ${h.to}` : h.to}</p>
            {h.note && <p className="text-ink">{h.note}</p>}
            <p className="mono text-[0.7rem] text-muted">{day(h.at)}{h.user ? ` · ${h.user}` : ""}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-white p-4 md:p-5 ${className}`}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-line/60 py-2 text-sm last:border-0">
      <span className="w-24 shrink-0 text-muted">{label}</span>
      <span className="min-w-0 flex-1 break-words font-medium text-navy">{value}</span>
    </div>
  );
}

function Fact({ label, value, className = "" }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 truncate font-semibold text-navy">{value}</p>
    </div>
  );
}

function Contact({ href, external, className, children }: { href: string; external?: boolean; className: string; children: React.ReactNode }) {
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex min-w-24 flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 sm:flex-none ${className}`}>
      {children}
    </a>
  );
}
