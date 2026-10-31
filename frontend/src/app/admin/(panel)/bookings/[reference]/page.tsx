import type { Metadata } from "next";
import { BookingDetailView } from "@/components/admin/BookingDetailView";
import { PageHeader, StatusBadge, day } from "@/components/admin/ui";
import { loadBooking } from "@/lib/admin/bookings";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Booking" };

/** Full page (a direct link or a reload); from the lists the same view opens in a side panel. */
export default async function BookingPage({ params }: PageProps<"/admin/bookings/[reference]">) {
  const { reference } = await params;
  const b = await loadBooking(reference);

  return (
    <>
      <PageHeader title={b.name} subtitle={`${b.reference} · received ${day(b.created_at)} · ${b.locale.toUpperCase()} · ${b.source}`}
        back={{ href: "/admin/bookings", label: "Bookings" }} actions={<StatusBadge status={b.status} />} />
      <BookingDetailView booking={b} />
    </>
  );
}
