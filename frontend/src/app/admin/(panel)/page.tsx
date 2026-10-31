import type { Metadata } from "next";
import Link from "next/link";
import { Ago } from "@/components/admin/Ago";
import { Card, Empty, PageHeader, StatusBadge, day, money } from "@/components/admin/ui";
import { adminApi, currentUser } from "@/lib/admin/api";
import type { DashboardData, DashboardRow } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [user, data] = await Promise.all([currentUser(), adminApi<DashboardData>("/dashboard")]);
  const s = data.stats;
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Casablanca" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const tiles = [
    { label: "Requests to answer", value: s.pending_bookings, href: "/admin/bookings?status=pending", alert: s.pending_bookings > 0 },
    { label: "New this week", value: s.new_this_week, href: "/admin/bookings" },
    { label: "Confirmed this month", value: s.confirmed_this_month, href: "/admin/bookings?status=confirmed" },
    { label: "Booked this month", value: money(s.revenue_this_month), href: "/admin/bookings?status=confirmed" },
  ];
  const todo = [
    { label: "reviews waiting for approval", value: s.pending_reviews, href: "/admin/reviews?status=pending" },
  ].filter((t) => t.value > 0);

  return (
    <>
      <PageHeader title={`${greeting}, ${user.name.split(" ")[0]}`} subtitle={`${s.published_tours} trips online`} />
      <div className="space-y-5 p-4 md:p-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link key={t.label} href={t.href} className={`rounded-lg border p-4 transition-colors hover:border-navy/40 ${t.alert ? "border-gold/50 bg-gold/10" : "border-line bg-white"}`}>
              <p className="font-display text-2xl font-semibold text-navy md:text-3xl">{t.value}</p>
              <p className="mt-1 text-xs font-medium text-muted md:text-sm">{t.label}</p>
            </Link>
          ))}
        </div>

        {todo.length > 0 && (
          <Card title="To do">
            <ul className="divide-y divide-line">
              {todo.map((t) => (
                <li key={t.label}>
                  <Link href={t.href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-gold">
                    <span><span className="font-semibold text-navy">{t.value}</span> {t.label}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Latest requests" actions={<Link href="/admin/bookings" className="text-sm font-semibold text-gold hover:underline">All</Link>}>
            {data.recent.length ? <Rows rows={data.recent} when="created" /> : <Empty>No booking requests yet.</Empty>}
          </Card>
          <Card title="Departures in the next 30 days">
            {data.upcoming.length ? <Rows rows={data.upcoming} when="start" /> : <Empty>No confirmed departures in the next 30 days.</Empty>}
          </Card>
        </div>
      </div>
    </>
  );
}

function Rows({ rows, when }: { rows: DashboardRow[]; when: "created" | "start" }) {
  return (
    <ul className="-mx-1 divide-y divide-line">
      {rows.map((b) => (
        <li key={b.reference}>
          <Link href={`/admin/bookings?open=${b.reference}`} className="flex items-center gap-3 rounded px-1 py-2.5 hover:bg-cream">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy">{b.name}</p>
              <p className="truncate text-xs text-muted">{b.tour_title ?? "Tailor-made trip"} · {b.guests} pax</p>
            </div>
            <div className="shrink-0 text-right">
              <StatusBadge status={b.status} />
              <p className="mono mt-1 text-[0.7rem] text-muted">{when === "created" ? <Ago iso={b.created_at} /> : day(b.start_date, false)}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
