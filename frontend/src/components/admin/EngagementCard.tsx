import Link from "next/link";
import { Card, Empty } from "@/components/admin/ui";
import type { EngagementData } from "@/lib/admin/types";

const CHANNEL: Record<string, string> = {
  google_ads: "Google Ads",
  google_organic: "Google search (free)",
  search: "Other search engines",
  social: "Social networks",
  referral: "Other websites",
  direct: "Direct / unknown",
  unknown: "Not recorded",
};
const DEVICE: Record<string, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Computer", unknown: "Unknown" };
const PERIODS = [7, 30, 90] as const;

const pct = (n: number, of: number) => (of > 0 ? `${((n / of) * 100).toFixed(n / of >= 0.1 ? 0 : 1)}%` : "—");
const flag = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
const shortDay = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

/**
 * The dashboard's "Website activity" block: visits and clicks on WhatsApp, phone and email (counted anonymously by the
 * website) next to the booking requests, by day, by where the visitor came from and by page.
 */
export function EngagementCard({ data }: { data: EngagementData }) {
  const t = data.totals;
  const contacts = t.whatsapp + t.phone + t.email;
  const tiles = [
    { label: "Visits", value: t.visits, note: "people who opened the site", color: "bg-navy/70" },
    { label: "WhatsApp clicks", value: t.whatsapp, note: `${pct(t.whatsapp, t.visits)} of visits`, color: "bg-[#25D366]" },
    { label: "Phone clicks", value: t.phone, note: `${pct(t.phone, t.visits)} of visits`, color: "bg-sahara" },
    { label: "Email clicks", value: t.email, note: `${pct(t.email, t.visits)} of visits`, color: "bg-gold" },
    { label: "Booking requests", value: t.requests, note: `${pct(t.requests, t.visits)} of visits`, color: "bg-navy" },
  ];
  const max = Math.max(1, ...data.daily.map((d) => d.whatsapp + d.phone + d.email + d.requests));
  const labelEvery = data.days <= 7 ? 1 : data.days <= 30 ? 5 : 15;

  return (
    <Card
      title="Website activity"
      actions={
        <div className="flex items-center gap-1 text-sm" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <Link key={p} href={p === 30 ? "/admin" : `/admin?days=${p}`} aria-current={data.days === p ? "true" : undefined}
              className={`rounded-full px-3 py-1 font-semibold ${data.days === p ? "bg-navy text-white" : "text-muted hover:text-navy"}`}>
              {p} days
            </Link>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((x) => (
          <div key={x.label} className="rounded-md border border-line p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-muted"><span className={`h-2 w-2 rounded-full ${x.color}`} aria-hidden="true" />{x.label}</p>
            <p className="font-display mt-1 text-2xl font-semibold text-navy">{x.value}</p>
            <p className="mt-0.5 text-[0.7rem] text-muted">{x.note}</p>
          </div>
        ))}
      </div>

      {t.visits === 0 && contacts === 0 ? (
        <Empty>No activity counted yet{data.tracking_since ? "" : ": the counting starts with the next visitors of the website."}</Empty>
      ) : (
        <>
          {/* contacts and requests per day */}
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Contacts and requests per day</p>
            <div className="mt-3 flex h-28 items-end gap-[3px]" role="img" aria-label="Bar chart of contacts and booking requests per day">
              {data.daily.map((d, i) => {
                const total = d.whatsapp + d.phone + d.email + d.requests;
                const part = (n: number, color: string) => n > 0 && <div className={color} style={{ height: `${(n / max) * 100}%` }} />;
                return (
                  <div key={d.date} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end" title={`${shortDay(d.date)}: ${d.visits} visits, ${d.whatsapp} WhatsApp, ${d.phone} phone, ${d.email} email, ${d.requests} requests`}>
                    {total === 0 ? <div className="h-px bg-line" /> : (
                      <>
                        {part(d.requests, "bg-navy")}
                        {part(d.email, "bg-gold")}
                        {part(d.phone, "bg-sahara")}
                        {part(d.whatsapp, "bg-[#25D366]")}
                      </>
                    )}
                    {(data.days - 1 - i) % labelEvery === 0 && <span className="mono absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[0.6rem] text-muted">{shortDay(d.date)}</span>}
                  </div>
                );
              })}
            </div>
            <div className="h-4" />
          </div>

          {/* where the visitors come from */}
          <div className="mt-5 overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Where visitors come from</p>
            <table className="mt-2 w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="py-1.5 pr-3 font-medium">Channel</th>
                  <th className="px-2 text-right font-medium">Visits</th>
                  <th className="px-2 text-right font-medium">WhatsApp</th>
                  <th className="px-2 text-right font-medium">Phone</th>
                  <th className="px-2 text-right font-medium">Email</th>
                  <th className="px-2 text-right font-medium">Requests</th>
                  <th className="pl-2 text-right font-medium">Contact rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.channels.map((c) => {
                  const n = c.whatsapp + c.phone + c.email + c.requests;
                  return (
                    <tr key={c.channel} className={c.channel === "google_ads" ? "bg-gold/10" : ""}>
                      <td className="py-2 pr-3 font-semibold text-navy">{CHANNEL[c.channel] ?? c.channel}</td>
                      <td className="px-2 text-right">{c.visits}</td>
                      <td className="px-2 text-right">{c.whatsapp}</td>
                      <td className="px-2 text-right">{c.phone}</td>
                      <td className="px-2 text-right">{c.email}</td>
                      <td className="px-2 text-right">{c.requests}</td>
                      <td className="pl-2 text-right text-muted">{c.visits > 0 ? pct(n, c.visits) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Pages with the most contact clicks</p>
              {data.pages.length ? (
                <ul className="mt-2 divide-y divide-line text-sm">
                  {data.pages.map((p) => (
                    <li key={p.page} className="flex items-center justify-between gap-3 py-2">
                      <span className="mono min-w-0 truncate text-xs normal-case text-navy" title={p.page}>{p.page}</span>
                      <span className="shrink-0 text-xs text-muted">
                        <b className="text-navy">{p.total}</b> · WhatsApp {p.whatsapp} · phone {p.phone} · email {p.email}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-muted">No contact click yet.</p>}
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Devices (visits)</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {data.devices.map((d) => (
                    <li key={d.device} className="flex justify-between"><span>{DEVICE[d.device] ?? d.device}</span><span className="text-muted">{d.visits} · {pct(d.visits, t.visits)}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Countries</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {data.countries.map((c) => (
                    <li key={c.country} className="flex justify-between"><span>{flag(c.country)} {c.country}</span><span className="text-muted">{c.visits} visits · {c.contacts} contacts</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        Counted by the website itself, anonymously (no cookie, no address stored){data.tracking_since ? `, since ${shortDay(data.tracking_since)}` : ""}. A visit is counted once per browser session.
        Booking requests come from the bookings list (cancelled ones, such as spam, are left out). Phone and email clicks show interest, not a conversation: not every click becomes a call or a message.
      </p>
    </Card>
  );
}
