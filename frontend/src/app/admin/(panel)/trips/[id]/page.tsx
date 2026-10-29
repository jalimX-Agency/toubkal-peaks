import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TripEditor } from "@/components/admin/TripEditor";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { TourDetail } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Trip" };

export default async function TripPage({ params }: PageProps<"/admin/trips/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  let tour: TourDetail;
  try {
    tour = (await adminApi<{ data: TourDetail }>(`/tours/${id}`)).data;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader title={tour.translations.en?.title ?? `Trip ${tour.id}`} subtitle={`${tour.category ?? ""} · #${tour.id}`}
        back={{ href: "/admin/trips", label: "Trips" }}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={tour.status} kind="tour" />
            {tour.paths.en && <a href={tour.paths.en} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gold hover:underline">View on website ↗</a>}
          </div>
        } />
      <TripEditor tour={tour} />
    </>
  );
}
