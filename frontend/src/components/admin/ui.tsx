import Link from "next/link";
import type { BookingStatus, ReviewStatus, TourStatus, TranslationStatus } from "@/lib/admin/types";

/** Small building blocks shared by the admin pages (server-safe, no state). */

export function PageHeader({ title, subtitle, back, actions }: { title: string; subtitle?: string; back?: { href: string; label: string }; actions?: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-white px-4 pb-4 pt-5 md:px-8 md:pt-8">
      {back && <Link href={back.href} className="text-sm font-semibold text-gold hover:underline">← {back.label}</Link>}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[1.6rem] font-semibold leading-tight text-navy md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function Card({ title, children, className = "", actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-lg border border-line bg-white p-4 md:p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const BOOKING: Record<BookingStatus, string> = {
  pending: "bg-gold/15 text-gold",
  confirmed: "bg-imperial/10 text-imperial",
  paid: "bg-atlas/10 text-atlas",
  completed: "bg-navy/10 text-navy",
  cancelled: "bg-sahara/10 text-sahara",
};
const REVIEW: Record<ReviewStatus, string> = { pending: "bg-gold/15 text-gold", published: "bg-atlas/10 text-atlas", hidden: "bg-muted/15 text-muted" };
const TOUR: Record<TourStatus, string> = { draft: "bg-gold/15 text-gold", published: "bg-atlas/10 text-atlas", archived: "bg-muted/15 text-muted" };

export function StatusBadge({ status, kind = "booking" }: { status: string; kind?: "booking" | "review" | "tour" }) {
  const map = kind === "booking" ? BOOKING : kind === "review" ? REVIEW : TOUR;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${(map as Record<string, string>)[status] ?? "bg-sand text-navy"}`}>
      {status}
    </span>
  );
}

/** One language's translation state: source (English), machine, reviewed or missing. */
export function TranslationDot({ locale, status }: { locale: string; status: TranslationStatus }) {
  const style = status === "source" || status === "reviewed" ? "border-atlas/40 bg-atlas/10 text-atlas" : status === "machine" ? "border-gold/40 bg-gold/10 text-gold" : "border-sahara/40 bg-sahara/10 text-sahara";
  const label = status === "source" ? "source" : status === "reviewed" ? "reviewed" : status === "machine" ? "machine translation, to review" : "missing";
  return <span title={`${locale.toUpperCase()}: ${label}`} className={`mono inline-flex h-6 w-7 items-center justify-center rounded border text-[0.65rem] ${style}`}>{locale.toUpperCase()}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-line bg-white px-4 py-10 text-center text-muted">{children}</p>;
}

/** Status filter pills that keep the other query parameters. */
export function FilterTabs({ base, current, options, params }: { base: string; current: string; options: { value: string; label: string; count?: number }[]; params: Record<string, string | undefined> }) {
  const href = (value: string) => {
    const q = new URLSearchParams(Object.entries({ ...params, status: value || undefined, page: undefined }).filter(([, v]) => v) as [string, string][]);
    return q.size ? `${base}?${q}` : base;
  };
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {options.map((o) => (
        <Link key={o.value} href={href(o.value)} aria-current={current === o.value ? "page" : undefined}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${current === o.value ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/40"}`}>
          {o.label}{o.count !== undefined && <span className={`ml-1.5 ${current === o.value ? "text-white/70" : "text-muted"}`}>{o.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function Pagination({ base, page, last, params }: { base: string; page: number; last: number; params: Record<string, string | undefined> }) {
  if (last <= 1) return null;
  const href = (p: number) => `${base}?${new URLSearchParams(Object.entries({ ...params, page: String(p) }).filter(([, v]) => v) as [string, string][])}`;
  return (
    <nav className="flex items-center justify-between gap-3 pt-4 text-sm" aria-label="Pages">
      {page > 1 ? <Link href={href(page - 1)} className="font-semibold text-navy hover:underline">← Previous</Link> : <span />}
      <span className="mono text-muted">{page} / {last}</span>
      {page < last ? <Link href={href(page + 1)} className="font-semibold text-navy hover:underline">Next →</Link> : <span />}
    </nav>
  );
}

export const money = (amount: number | null | undefined, currency = "EUR") =>
  amount === null || amount === undefined ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const day = (iso: string | null | undefined, withYear = true) =>
  iso ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) }).format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)) : "—";

export const ago = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / 1440)} d ago`;
  return day(iso);
};
