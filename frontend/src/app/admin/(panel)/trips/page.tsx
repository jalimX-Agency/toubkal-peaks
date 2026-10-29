import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Empty, FilterTabs, PageHeader, StatusBadge, TranslationDot, money } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import type { AdminLocale, TourRow } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Trips" };

const LOCALES: AdminLocale[] = ["en", "fr", "es", "de"];

export default async function TripsPage({ searchParams }: PageProps<"/admin/trips">) {
  const raw = await searchParams;
  const params = {
    status: typeof raw.status === "string" ? raw.status : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
    todo: raw.todo === "prices" || raw.todo === "translations" ? raw.todo : undefined,
  };
  const query = new URLSearchParams(Object.entries({ status: params.status, q: params.q }).filter(([, v]) => v) as [string, string][]);
  const { data } = await adminApi<{ data: TourRow[] }>(`/tours?${query}`);
  const rows = data.filter((t) =>
    params.todo === "prices" ? t.price_mode === "tiers" && !t.price_reviewed
      : params.todo === "translations" ? LOCALES.some((l) => t.translations[l] === "machine" || t.translations[l] === null)
      : true,
  );

  return (
    <>
      <PageHeader title="Trips" subtitle={`${rows.length} of ${data.length}`} />
      <div className="space-y-4 p-4 md:p-8">
        <form className="flex gap-2" role="search">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input name="q" defaultValue={params.q} type="search" placeholder="Search a trip"
            className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2.5 text-base outline-none focus:border-navy md:text-sm" />
          <button className="rounded-md bg-navy px-4 text-sm font-semibold text-white">Search</button>
        </form>
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs base="/admin/trips" current={params.status ?? ""} params={params}
            options={[{ value: "", label: "All" }, { value: "published", label: "Online" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} />
          <div className="flex gap-2 text-sm">
            <Link href={params.todo === "prices" ? "/admin/trips" : "/admin/trips?todo=prices"} className={`rounded-full border px-3 py-1.5 font-semibold ${params.todo === "prices" ? "border-gold bg-gold text-white" : "border-gold/50 text-gold"}`}>Prices to check</Link>
            <Link href={params.todo === "translations" ? "/admin/trips" : "/admin/trips?todo=translations"} className={`rounded-full border px-3 py-1.5 font-semibold ${params.todo === "translations" ? "border-gold bg-gold text-white" : "border-gold/50 text-gold"}`}>Translations to review</Link>
          </div>
        </div>

        {rows.length === 0 ? <Empty>No trip matches.</Empty> : (
          <ul className="grid gap-2.5 lg:grid-cols-2">
            {rows.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/trips/${t.id}`} className="flex gap-3 rounded-lg border border-line bg-white p-3 transition-colors hover:border-navy/40">
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
                    {t.hero && <Image src={t.hero} alt="" fill sizes="80px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 font-semibold leading-snug text-navy">{t.title}</span>
                      <StatusBadge status={t.status} kind="tour" />
                    </span>
                    <span className="mono mt-1 block text-[0.7rem] text-muted">
                      {t.category} · {t.duration_days ? `${t.duration_days} d` : "—"} · {t.price_mode === "tiers" ? `from ${money(t.from_price, t.currency)}` : "on request"}
                      {t.price_mode === "tiers" && !t.price_reviewed && <span className="text-gold"> · price to check</span>}
                    </span>
                    <span className="mt-2 flex gap-1">
                      {LOCALES.map((l) => <TranslationDot key={l} locale={l} status={t.translations[l]} />)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
