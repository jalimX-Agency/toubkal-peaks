import { Suspense } from "react";
import { PanelSkeleton, SidePanel } from "@/components/admin/SidePanel";
import { TripEditor } from "@/components/admin/TripEditor";
import { StatusBadge } from "@/components/admin/ui";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { TourDetail } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

const CLOSE = "/admin/trips";

/** The list itself is the layout; this page is only the trip opened over it (?open=ID). */
export default async function TripsPage({ searchParams }: PageProps<"/admin/trips">) {
  const { open } = await searchParams;
  if (typeof open !== "string" || !/^\d{1,9}$/.test(open)) return null;
  return (
    <Suspense key={open} fallback={<PanelSkeleton closeHref={CLOSE} />}>
      <TripPanel id={open} />
    </Suspense>
  );
}

/** Same editor as the trip's full page, in a wide side panel (same session check and API call). */
async function TripPanel({ id }: { id: string }) {
  let tour: TourDetail;
  try {
    tour = (await adminApi<{ data: TourDetail }>(`/tours/${id}`)).data;
  } catch (error) {
    if (!(error instanceof AdminApiError && error.status === 404)) throw error;
    return (
      <SidePanel title="Trip not found" closeHref={CLOSE}>
        <p className="p-6 text-sm text-muted">This trip does not exist.</p>
      </SidePanel>
    );
  }
  return (
    <SidePanel wide title={tour.translations.en?.title ?? `Trip ${tour.id}`} subtitle={`${tour.category ?? ""} · #${tour.id}`}
      badge={<StatusBadge status={tour.status} kind="tour" />} fullHref={`/admin/trips/${tour.id}`} closeHref={CLOSE}>
      <TripEditor tour={tour} />
    </SidePanel>
  );
}
