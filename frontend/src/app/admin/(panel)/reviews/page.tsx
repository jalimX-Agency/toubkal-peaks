import type { Metadata } from "next";
import { ReviewForm, ReviewItem } from "@/components/admin/ReviewForms";
import { Empty, FilterTabs, PageHeader, Pagination } from "@/components/admin/ui";
import { LiveSearch } from "@/components/admin/LiveSearch";
import { adminApi } from "@/lib/admin/api";
import type { AdminReview, Paged, ReviewStatus, TourRow } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  const raw = await searchParams;
  const params = {
    status: typeof raw.status === "string" ? raw.status : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
    page: typeof raw.page === "string" ? raw.page : undefined,
  };
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]);
  const [res, tours] = await Promise.all([
    adminApi<Paged<AdminReview, ReviewStatus>>(`/reviews?${query}`),
    adminApi<{ data: TourRow[] }>("/tours"),
  ]);
  const tourOptions = tours.data.map((t) => ({ id: t.id, title: t.title ?? `#${t.id}` }));

  return (
    <>
      <PageHeader title="Reviews" subtitle="What travellers say, shown on the website once published." />
      <div className="space-y-4 p-4 md:p-8">
        <details className="rounded-lg border border-line bg-white">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gold [&::-webkit-details-marker]:hidden">+ Add a review from TripAdvisor, Google…</summary>
          <div className="border-t border-line p-4"><ReviewForm tours={tourOptions} /></div>
        </details>

        <LiveSearch placeholder="Author or text" />
        <FilterTabs base="/admin/reviews" current={params.status ?? ""} params={params} options={[
          { value: "", label: "All", count: Object.values(res.counts).reduce((a, b) => a + b, 0) },
          { value: "pending", label: "To approve", count: res.counts.pending },
          { value: "published", label: "Published", count: res.counts.published },
          { value: "hidden", label: "Hidden", count: res.counts.hidden },
        ]} />

        {res.data.length === 0 ? <Empty>No reviews here.</Empty> : (
          <ul className="space-y-3">
            {res.data.map((r) => <ReviewItem key={r.id} review={r} tours={tourOptions} />)}
          </ul>
        )}
        <Pagination base="/admin/reviews" page={res.meta.current_page} last={res.meta.last_page} params={params} />
      </div>
    </>
  );
}
