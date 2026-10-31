import { notFound } from "next/navigation";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { BookingDetail } from "@/lib/admin/types";

/** One booking for its full page; an unknown reference is a 404. */
export async function loadBooking(reference: string): Promise<BookingDetail> {
  try {
    return (await adminApi<{ data: BookingDetail }>(`/bookings/${encodeURIComponent(reference)}`)).data;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }
}
