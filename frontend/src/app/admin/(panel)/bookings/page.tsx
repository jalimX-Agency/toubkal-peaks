import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Empty, FilterTabs, PageHeader, Pagination, StatusBadge, day } from "@/components/admin/ui";
import { BookingDetailView } from "@/components/admin/BookingDetailView";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { LiveSearch } from "@/components/admin/LiveSearch";
import { PanelSkeleton, SidePanel } from "@/components/admin/SidePanel";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { BookingDetail, BookingStatus, BookingSummary, Paged } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Bookings" };

const STATUSES: { value: BookingStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "To answer" },
  { value: "confirmed", label: "Confirmed" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const WHEN = [
  { value: "", label: "Any departure" },
  { value: "next30", label: "Next 30 days" },
  { value: "month", label: "This month" },
  { value: "nextmonth", label: "Next month" },
  { value: "past", label: "Already left" },
  { value: "none", label: "No date yet" },
];

/** The departure filter as dates for the API (only called after connection(): a per-request value). */
function departureRange(when: string | undefined): Record<string, string> {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const y = today.getUTCFullYear();
  const m = today.getUTCMonth();
  switch (when) {
    case "next30": return { from: iso(today), to: iso(new Date(today.getTime() + 30 * 86_400_000)) };
    case "month": return { from: iso(new Date(Date.UTC(y, m, 1))), to: iso(new Date(Date.UTC(y, m + 1, 0))) };
    case "nextmonth": return { from: iso(new Date(Date.UTC(y, m + 1, 1))), to: iso(new Date(Date.UTC(y, m + 2, 0))) };
    case "past": return { to: iso(new Date(today.getTime() - 86_400_000)) };
    case "none": return { no_date: "1" };
    default: return {};
  }
}

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const raw = await searchParams;
  const str = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : undefined);
  const params = {
    status: str("status"),
    q: str("q"),
    sort: raw.sort === "departure" ? "departure" : undefined,
    when: WHEN.some((w) => w.value && w.value === raw.when) ? str("when") : undefined,
    per_page: ["50", "100"].includes(str("per_page") ?? "") ? str("per_page") : undefined,
    page: str("page"),
  };
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  const open = typeof raw.open === "string" && /^[A-Za-z0-9-]{1,40}$/.test(raw.open) ? raw.open : null;
  // the list as it is (filters, page), without the panel: where closing the panel goes back to
  const listHref = `/admin/bookings${query.size ? `?${query}` : ""}`;
  const api = new URLSearchParams([...query].filter(([k]) => k !== "when"));
  if (params.when) {
    await connection(); // today's date is read per request, never while prerendering
    for (const [k, v] of Object.entries(departureRange(params.when))) api.set(k, v);
  }
  const res = await adminApi<Paged<BookingSummary, BookingStatus>>(`/bookings?${api}`);
  const all = Object.values(res.counts).reduce((a, b) => a + b, 0);
  const filtered = Boolean(params.q || params.when);

  return (
    <>
      <PageHeader title="Bookings" subtitle={`${res.meta.total} ${res.meta.total === 1 ? "request" : "requests"}${filtered ? " match" : ""}`} />
      <div className="space-y-4 p-4 md:p-8">
        <LiveSearch placeholder="Search name, email, phone, reference, trip"
          menus={[
            { param: "when", label: "Departure", options: WHEN },
            { param: "per_page", label: "Per page", options: [{ value: "", label: "25 per page" }, { value: "50", label: "50 per page" }, { value: "100", label: "100 per page" }] },
          ]}
          sorts={[{ value: "", label: "Newest first" }, { value: "departure", label: "By departure" }]} />
        <FilterTabs base="/admin/bookings" current={params.status ?? ""} params={params}
          options={STATUSES.map((s) => ({ ...s, count: s.value ? res.counts[s.value as BookingStatus] : all }))} />

        {res.data.length === 0 ? (
          <Empty>{filtered ? "No booking matches these filters." : "No bookings here yet."}</Empty>
        ) : (
          <>
            {/* new rows (another page or filter) start with nothing selected */}
            <BookingsTable key={listHref} rows={res.data} query={query.toString()} />
            <Pagination base="/admin/bookings" page={res.meta.current_page} last={res.meta.last_page} params={params} />
          </>
        )}
      </div>

      {open && (
        <Suspense key={open} fallback={<PanelSkeleton closeHref={listHref} />}>
          <BookingPanel reference={open} closeHref={listHref} />
        </Suspense>
      )}
    </>
  );
}

/**
 * A booking opened from the list: the same view as its full page, in a side panel over the list
 * (same server-side session check and API call; the address keeps ?open= so a reload reopens it).
 */
async function BookingPanel({ reference, closeHref }: { reference: string; closeHref: string }) {
  let b: BookingDetail;
  try {
    b = (await adminApi<{ data: BookingDetail }>(`/bookings/${encodeURIComponent(reference)}`)).data;
  } catch (error) {
    if (!(error instanceof AdminApiError && error.status === 404)) throw error;
    return (
      <SidePanel title="Booking not found" closeHref={closeHref}>
        <p className="p-6 text-sm text-muted">This booking does not exist or was deleted.</p>
      </SidePanel>
    );
  }
  return (
    <SidePanel title={b.name} subtitle={`${b.reference} · received ${day(b.created_at)} · ${b.locale.toUpperCase()}`}
      badge={<StatusBadge status={b.status} />} fullHref={`/admin/bookings/${b.reference}`} closeHref={closeHref}>
      <BookingDetailView booking={b} inPanel />
    </SidePanel>
  );
}
