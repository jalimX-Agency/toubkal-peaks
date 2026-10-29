"use server";

import { hasLocale } from "@/i18n/config";
import { getTour } from "@/lib/api";
import type { TourDetail } from "@/lib/types";

/** Price tiers of one trip for the reservation wizard's estimate (served from the site's cache). */
export async function getTripPricing(slug: string, locale: string): Promise<TourDetail["pricing"] | null> {
  if (!hasLocale(locale) || !/^[a-z0-9-]{1,200}$/.test(slug)) return null;
  try {
    return (await getTour(slug, locale))?.pricing ?? null;
  } catch {
    return null; // no estimate this time; the wizard still works
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type BookingState =
  | { status: "idle" }
  | { status: "success"; reference: string }
  | { status: "invalid"; errors: Record<string, string[]>; values: Record<string, string> }
  | { status: "error"; values: Record<string, string> };

const FIELDS = ["tour_id", "locale", "first_name", "last_name", "email", "phone", "country", "start_date", "adults", "children", "special_requests", "website"] as const;

/**
 * Sends a booking request from the site's own server to the Laravel API, so the browser never talks to
 * the API directly (no CORS, no exposed endpoint). Validation errors come back per field.
 */
export async function submitBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const values = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) ?? "").trim()])) as Record<string, string>;
  const payload = {
    ...values,
    tour_id: values.tour_id ? Number(values.tour_id) : null,
    adults: values.adults ? Number(values.adults) : null,
    children: values.children ? Number(values.children) : 0,
    start_date: values.start_date || null,
    consent: form.get("consent") === "on",
  };

  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => ({}))) as { data?: { reference?: string }; errors?: Record<string, string[]> };
    if (res.status === 422) return { status: "invalid", errors: body.errors ?? {}, values };
    if (!res.ok) return { status: "error", values };
    return { status: "success", reference: body.data?.reference ?? "" };
  } catch {
    return { status: "error", values };
  }
}
