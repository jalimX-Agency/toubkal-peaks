import { BookingDelete, BookingEditForm, BookingNotesForm, BookingStatusActions } from "@/components/admin/BookingForms";
import { Card, day, money } from "@/components/admin/ui";
import type { BookingDetail } from "@/lib/admin/types";

/** A booking's details and actions, shared by the full page and the side panel opened from the lists. */
export function BookingDetailView({ booking: b, inPanel = false }: { booking: BookingDetail; inPanel?: boolean }) {
  const phone = b.phone?.replace(/[^\d+]/g, "") ?? "";
  const greeting = `Hello ${b.first_name}, thank you for your request ${b.reference}${b.tour_title ? ` for "${b.tour_title}"` : ""}.`;
  const mail = `mailto:${b.email}?subject=${encodeURIComponent(`Your trip request ${b.reference}`)}&body=${encodeURIComponent(`${greeting}\n\n`)}`;
  const publicPath = b.tour_slug ? `/book?trip=${b.tour_slug}` : null;

  return (
      <div className={`grid gap-5 ${inPanel ? "p-4 md:p-6" : "p-4 md:p-8 lg:grid-cols-12"}`}>
        <div className={`space-y-5 ${inPanel ? "" : "lg:col-span-7"}`}>
          {/* quick contact: the first thing the team does with a new request */}
          <div className="grid grid-cols-3 gap-2">
            {phone && (
              <a href={`https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(greeting)}`} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-lg bg-[#25D366] px-2 py-3 text-xs font-semibold text-white">WhatsApp</a>
            )}
            <a href={mail} className="flex flex-col items-center gap-1 rounded-lg bg-navy px-2 py-3 text-xs font-semibold text-white">Email</a>
            {phone && <a href={`tel:${phone}`} className="flex flex-col items-center gap-1 rounded-lg border border-line bg-white px-2 py-3 text-xs font-semibold text-navy">Call</a>}
          </div>

          <Card title="Request">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Item label="Trip" value={b.tour_title ?? "Tailor-made trip"} wide />
              <Item label="Departure" value={b.start_date ? day(b.start_date) : "Not decided"} />
              <Item label="Return" value={day(b.end_date)} />
              <Item label="Travellers" value={`${b.adults} adult${b.adults > 1 ? "s" : ""}${b.children ? `, ${b.children} child${b.children > 1 ? "ren" : ""}` : ""}`} />
              <Item label="Estimate" value={money(b.total_price, b.currency)} />
              <Item label="Email" value={b.email} />
              <Item label="Phone" value={b.phone ?? "—"} />
              <Item label="Country" value={b.country ?? "—"} />
              {publicPath && <Item label="Website" value={<a href={publicPath} target="_blank" rel="noreferrer" className="text-gold hover:underline">Open the trip ↗</a>} />}
            </dl>
            {b.special_requests && (
              <div className="mt-4 rounded-md bg-sand/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Message from the customer</p>
                <p className="mt-1 whitespace-pre-line text-sm text-ink">{b.special_requests}</p>
              </div>
            )}
          </Card>

          <Card title="Agreed details">
            <BookingEditForm booking={b} />
          </Card>
        </div>

        <div className={`space-y-5 ${inPanel ? "" : "lg:col-span-5"}`}>
          <Card title="Status">
            <BookingStatusActions reference={b.reference} current={b.status} next={b.next_statuses} deposit={b.deposit_amount} currency={b.currency} />
          </Card>

          <Card title="Payment">
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <Item label="Total" value={money(b.total_price, b.currency)} />
              <Item label="Paid" value={money(b.paid_amount, b.currency)} />
              <Item label="Balance" value={money(b.balance_due, b.currency)} />
            </dl>
          </Card>

          <Card title="Internal notes">
            <BookingNotesForm reference={b.reference} notes={b.admin_notes} />
          </Card>

          <Card title="Delete">
            <BookingDelete reference={b.reference} name={b.name} />
          </Card>

          <Card title="History">
            <ol className="space-y-3 border-l-2 border-line pl-4">
              {[...b.history].reverse().map((h, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
                  <p className="font-medium text-navy">
                    {h.from ? <><span className="capitalize">{h.from}</span> → <span className="capitalize">{h.to}</span></> : <span className="capitalize">{h.to}</span>}
                  </p>
                  {h.note && <p className="text-ink">{h.note}</p>}
                  <p className="mono text-[0.7rem] text-muted">{day(h.at)}{h.user ? ` · ${h.user}` : ""}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
  );
}

function Item({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-navy">{value}</dd>
    </div>
  );
}
