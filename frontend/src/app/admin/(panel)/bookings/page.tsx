import type { Metadata } from "next";
import Link from "next/link";
import { Empty, FilterTabs, PageHeader, Pagination, StatusBadge, ago, day, money } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import type { BookingStatus, BookingSummary, Paged } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Bookings" };

const STATUSES: { value: BookingStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "To answer" },
  { value: "confirmed", label: "Confirmed" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const raw = await searchParams;
  const params = {
    status: typeof raw.status === "string" ? raw.status : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
    sort: raw.sort === "departure" ? "departure" : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  };
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  const res = await adminApi<Paged<BookingSummary, BookingStatus>>(`/bookings?${query}`);
  const all = Object.values(res.counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader title="Bookings" subtitle={`${res.meta.total} ${res.meta.total === 1 ? "request" : "requests"}`} />
      <div className="space-y-4 p-4 md:p-8">
        <form className="flex gap-2" role="search">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input name="q" defaultValue={params.q} type="search" placeholder="Name, email, phone, reference or trip"
            className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-navy md:text-sm" />
          <select name="sort" defaultValue={params.sort ?? ""} className="rounded-md border border-line bg-white px-2 text-sm text-navy" aria-label="Sort">
            <option value="">Newest</option>
            <option value="departure">Departure date</option>
          </select>
          <button className="rounded-md bg-navy px-4 text-sm font-semibold text-white">Search</button>
        </form>
        <FilterTabs base="/admin/bookings" current={params.status ?? ""} params={params}
          options={STATUSES.map((s) => ({ ...s, count: s.value ? res.counts[s.value as BookingStatus] : all }))} />

        {res.data.length === 0 ? (
          <Empty>{params.q ? "No booking matches your search." : "No bookings here yet."}</Empty>
        ) : (
          <>
            {/* phones: cards */}
            <ul className="space-y-2.5 md:hidden">
              {res.data.map((b) => (
                <li key={b.reference}>
                  <Link href={`/admin/bookings/${b.reference}`} className="block rounded-lg border border-line bg-white p-4 active:bg-cream">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">{b.name}</p>
                        <p className="truncate text-sm text-muted">{b.tour_title ?? "Tailor-made trip"}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mono mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-muted">
                      <span>{day(b.start_date)}</span>
                      <span>{b.adults + b.children} pax</span>
                      <span>{money(b.total_price, b.currency)}</span>
                      <span className="ml-auto">{ago(b.created_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* tablet and desktop: table */}
            <div className="hidden overflow-hidden rounded-lg border border-line bg-white md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Trip</th>
                    <th className="px-4 py-3 font-semibold">Departure</th>
                    <th className="px-4 py-3 font-semibold">Pax</th>
                    <th className="px-4 py-3 text-right font-semibold">Estimate</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {res.data.map((b) => (
                    <tr key={b.reference} className="relative hover:bg-cream">
                      <td className="px-4 py-3">
                        <Link href={`/admin/bookings/${b.reference}`} className="font-semibold text-navy after:absolute after:inset-0">{b.name}</Link>
                        <p className="mono text-[0.7rem] text-muted">{b.reference} · {b.locale.toUpperCase()}</p>
                      </td>
                      <td className="max-w-64 truncate px-4 py-3 text-ink">{b.tour_title ?? <span className="text-muted">Tailor-made</span>}</td>
                      <td className="whitespace-nowrap px-4 py-3">{day(b.start_date)}</td>
                      <td className="px-4 py-3">{b.adults + b.children}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">{money(b.total_price, b.currency)}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{ago(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination base="/admin/bookings" page={res.meta.current_page} last={res.meta.last_page} params={params} />
          </>
        )}
      </div>
    </>
  );
}
