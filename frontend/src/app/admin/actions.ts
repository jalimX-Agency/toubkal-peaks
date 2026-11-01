"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AdminApiError, SESSION_COOKIE, SESSION_DAYS, adminApi, adminLogin } from "@/lib/admin/api";
import type { ActionState, AdminLocale, TourContent, TripImage } from "@/lib/admin/types";

/** Runs an admin API write and turns its errors into a form state (field errors included). */
async function attempt(run: () => Promise<unknown>, okMessage = "Saved"): Promise<ActionState> {
  try {
    await run();
    return { status: "ok", message: okMessage };
  } catch (error) {
    if (error instanceof AdminApiError) return { status: "error", message: error.message, errors: error.errors };
    // redirect() from an expired session must pass through
    throw error;
  }
}

const text = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const nullable = (form: FormData, key: string) => text(form, key) || null;
const number = (form: FormData, key: string) => (text(form, key) === "" ? null : Number(text(form, key)));

// --- session -----------------------------------------------------------------

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  let mustChange = false;
  try {
    const { token, user } = await adminLogin(text(form, "email"), String(form.get("password") ?? ""));
    mustChange = user.must_change_password;
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: SESSION_DAYS * 24 * 3600,
    });
  } catch (error) {
    if (error instanceof AdminApiError) return { status: "error", message: error.errors.email?.[0] ?? error.message };
    return { status: "error", message: "The admin is unreachable. Try again in a moment." };
  }
  const next = text(form, "next");
  redirect(mustChange ? "/admin/account?first=1" : next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  await adminApi("/auth/logout", { method: "POST" }).catch(() => undefined);
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await attempt(
    () => adminApi("/auth/password", {
      method: "PUT",
      body: JSON.stringify({
        current_password: form.get("current_password"),
        password: form.get("password"),
        password_confirmation: form.get("password_confirmation"),
      }),
    }),
    "Password changed",
  );
  if (result.status === "ok") revalidatePath("/admin", "layout");
  return result;
}

// --- bookings ----------------------------------------------------------------

export async function updateBooking(reference: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await attempt(() =>
    adminApi(`/bookings/${encodeURIComponent(reference)}`, {
      method: "PATCH",
      body: JSON.stringify({
        first_name: text(form, "first_name"),
        last_name: text(form, "last_name"),
        email: text(form, "email"),
        phone: nullable(form, "phone"),
        country: nullable(form, "country"),
        start_date: nullable(form, "start_date"),
        end_date: nullable(form, "end_date"),
        adults: number(form, "adults"),
        children: number(form, "children") ?? 0,
        price_per_person: number(form, "price_per_person"),
        total_price: number(form, "total_price"),
        deposit_amount: number(form, "deposit_amount"),
        paid_amount: number(form, "paid_amount") ?? 0,
      }),
    }),
  );
  if (result.status === "ok") revalidatePath(`/admin/bookings/${reference}`);
  return result;
}

export async function saveBookingNotes(reference: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await attempt(() =>
    adminApi(`/bookings/${encodeURIComponent(reference)}`, { method: "PATCH", body: JSON.stringify({ admin_notes: nullable(form, "admin_notes") }) }),
    "Notes saved",
  );
  if (result.status === "ok") revalidatePath(`/admin/bookings/${reference}`);
  return result;
}

export async function changeBookingStatus(reference: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  let emailed: boolean | null = null;
  const result = await attempt(async () => {
    const res = await adminApi<{ customer_emailed?: boolean | null }>(`/bookings/${encodeURIComponent(reference)}/status`, {
      method: "POST",
      body: JSON.stringify({ status: text(form, "status"), note: nullable(form, "note"), deposit_amount: number(form, "deposit_amount") }),
    });
    emailed = res.customer_emailed ?? null;
  }, "Status updated");
  if (result.status !== "ok") return result;
  revalidatePath(`/admin/bookings/${reference}`);
  revalidatePath("/admin/bookings");
  // confirming sends the customer the PayPal deposit link
  if (emailed === true) return { status: "ok", message: "Confirmed: the customer received the PayPal deposit email" };
  if (emailed === false) return { status: "error", message: "Confirmed, but the deposit email could not be sent: send the PayPal link yourself" };
  return result;
}

// --- trips -------------------------------------------------------------------

/** A trip changed: its full page, the list and the side panel opened over it. */
const revalidateTrips = () => revalidatePath("/admin/trips", "layout");

export async function updateTourSettings(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await attempt(() =>
    adminApi(`/tours/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: text(form, "status"),
        duration_days: number(form, "duration_days"),
        duration_nights: number(form, "duration_nights"),
        difficulty: nullable(form, "difficulty"),
        max_altitude_m: number(form, "max_altitude_m"),
        group_min: number(form, "group_min"),
        group_max: number(form, "group_max"),
        price_mode: text(form, "price_mode"),
        currency: text(form, "currency"),
        is_featured: form.get("is_featured") === "on",
        sort_order: number(form, "sort_order") ?? 0,
      }),
    }),
  );
  if (result.status === "ok") revalidateTrips();
  return result;
}

export async function saveTourPrices(id: number, tiers: { min_pax: number; max_pax: number | null; price_per_person: number | null }[]): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/tours/${id}/prices`, { method: "PUT", body: JSON.stringify({ tiers }) }), "Prices saved");
  if (result.status === "ok") revalidateTrips();
  return result;
}

export async function saveTourContent(id: number, locale: AdminLocale, content: Omit<TourContent, "updated_at">): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/tours/${id}/translations/${locale}`, { method: "PUT", body: JSON.stringify(content) }), "Content saved");
  if (result.status === "ok") revalidateTrips();
  return result;
}

// --- reviews -----------------------------------------------------------------

export async function setReviewStatus(id: number, status: "published" | "hidden"): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }));
  revalidatePath("/admin/reviews");
  return result;
}

export async function deleteReview(id: number): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/reviews/${id}`, { method: "DELETE" }), "Deleted");
  revalidatePath("/admin/reviews");
  return result;
}

export async function saveReview(id: number | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const payload = {
    source: text(form, "source"),
    author_name: text(form, "author_name"),
    author_country: nullable(form, "author_country"),
    rating: number(form, "rating"),
    title: nullable(form, "title"),
    body: text(form, "body"),
    language: nullable(form, "language"),
    reviewed_at: nullable(form, "reviewed_at"),
    url: nullable(form, "url"),
    tour_id: number(form, "tour_id"),
    status: text(form, "status") || "published",
    is_featured: form.get("is_featured") === "on",
  };
  const result = await attempt(() => adminApi(id ? `/reviews/${id}` : "/reviews", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) }));
  revalidatePath("/admin/reviews");
  return result;
}

// --- team page (people on the website's About page) -----------------------------

const LOCALES: AdminLocale[] = ["en", "fr", "es", "de"];

/** Biography fields hold paragraphs separated by an empty line. */
const paragraphs = (value: string) => value.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);

export async function savePerson(id: number | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const payload = {
    name: text(form, "name"),
    role: Object.fromEntries(LOCALES.map((l) => [l, text(form, `role_${l}`)])),
    bio: Object.fromEntries(LOCALES.map((l) => [l, paragraphs(text(form, `bio_${l}`))])),
    photo_alt: Object.fromEntries(LOCALES.map((l) => [l, text(form, `alt_${l}`)])),
    is_active: form.get("is_active") === "on",
  };
  const result = await attempt(() => adminApi(id ? `/team-members/${id}` : "/team-members", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) }), id ? "Saved" : "Added");
  revalidatePath("/admin/people");
  return result;
}

export async function uploadPersonPhoto(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a photo first." };
  const body = new FormData();
  body.append("photo", file);
  const result = await attempt(() => adminApi(`/team-members/${id}/photo`, { method: "POST", body }), "Photo updated");
  revalidatePath("/admin/people");
  return result;
}

export async function setPersonVisible(id: number, is_active: boolean): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/team-members/${id}`, { method: "PATCH", body: JSON.stringify({ is_active }) }), is_active ? "Shown on the website" : "Hidden");
  revalidatePath("/admin/people");
  return result;
}

export async function orderPeople(ids: number[]): Promise<ActionState> {
  const result = await attempt(() => adminApi("/team-members/order", { method: "PUT", body: JSON.stringify({ ids }) }), "Order saved");
  revalidatePath("/admin/people");
  return result;
}

export async function deletePerson(id: number): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/team-members/${id}`, { method: "DELETE" }), "Removed");
  revalidatePath("/admin/people");
  return result;
}

// --- blog ---------------------------------------------------------------------------

/** Article form: settings, publication, and per language title, summary, text (HTML) and photo description. */
export async function saveBlogPost(id: number | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const status = text(form, "status");
  const payload = {
    slug: text(form, "slug"),
    category: nullable(form, "category"),
    author: nullable(form, "author"),
    is_featured: form.get("is_featured") === "on",
    image_url: nullable(form, "image_url"),
    // the date field is in the browser's time; it is sent with the offset the browser added
    published_at: status === "draft" ? null : nullable(form, "published_at_iso") ?? new Date().toISOString(),
    title: Object.fromEntries(LOCALES.map((l) => [l, text(form, `title_${l}`)])),
    excerpt: Object.fromEntries(LOCALES.map((l) => [l, text(form, `excerpt_${l}`)])),
    content: Object.fromEntries(LOCALES.map((l) => [l, text(form, `content_${l}`)])),
    image_alt: Object.fromEntries(LOCALES.map((l) => [l, text(form, `alt_${l}`)])),
  };
  let created: number | null = null;
  const result = await attempt(async () => {
    const res = await adminApi<{ data: { id: number } }>(id ? `/blog-posts/${id}` : "/blog-posts", { method: id ? "PATCH" : "POST", body: JSON.stringify(payload) });
    created = id ? null : res.data.id;
  }, id ? "Saved" : "Created");
  revalidatePath("/admin/blog", "layout");
  if (created) redirect(`/admin/blog/${created}?created=1`);
  return result;
}

export async function uploadBlogCover(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a photo first." };
  const body = new FormData();
  body.append("photo", file);
  const result = await attempt(() => adminApi(`/blog-posts/${id}/cover`, { method: "POST", body }), "Cover photo updated");
  revalidatePath(`/admin/blog/${id}`);
  return result;
}

export async function deleteBlogPost(id: number): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/blog-posts/${id}`, { method: "DELETE" }), "Deleted");
  revalidatePath("/admin/blog", "layout");
  if (result.status === "ok") redirect("/admin/blog");
  return result;
}

// --- trip photos ------------------------------------------------------------------

/** One photo per call: the website's server limits the size of a request. */
export async function uploadTripPhoto(tourId: number, form: FormData): Promise<ActionState> {
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { status: "error", message: "Choose a photo first." };
  const body = new FormData();
  body.append("photo", file);
  const result = await attempt(() => adminApi(`/tours/${tourId}/images`, { method: "POST", body }), "Photo added");
  revalidateTrips();
  return result;
}

/** The trip's photos in order (first = main photo); photos left out are removed from the trip, library photos added. */
export async function setTripPhotos(tourId: number, ids: number[]): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/tours/${tourId}/images`, { method: "PUT", body: JSON.stringify({ ids }) }), "Photos saved");
  revalidateTrips();
  return result;
}

export async function describeTripPhoto(tourId: number, mediaId: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const alt = Object.fromEntries(LOCALES.map((l) => [l, text(form, `alt_${l}`)]));
  const result = await attempt(() => adminApi(`/tours/${tourId}/images/${mediaId}`, { method: "PATCH", body: JSON.stringify({ alt }) }), "Description saved");
  revalidateTrips();
  return result;
}

export async function searchPhotoLibrary(q: string, page = 1): Promise<{ data: TripImage[]; meta: { current_page: number; last_page: number; total: number } }> {
  const query = new URLSearchParams({ page: String(page), ...(q.trim() ? { q: q.trim() } : {}) });
  return adminApi(`/media?${query}`);
}

/** One action on the bookings ticked in the list; those that cannot make the move are reported. */
export async function bulkBookings(action: "complete" | "cancel" | "delete", references: string[]): Promise<ActionState> {
  if (!["complete", "cancel", "delete"].includes(action) || references.length === 0 || references.length > 100) {
    return { status: "error", message: "Select between 1 and 100 bookings." };
  }
  try {
    const { done, skipped } = await adminApi<{ done: string[]; skipped: string[] }>("/bookings/bulk", {
      method: "POST",
      body: JSON.stringify({ action, references: references.map(String) }),
    });
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    const verb = action === "complete" ? "completed" : action === "cancel" ? "cancelled" : "deleted";
    const message = `${done.length} ${done.length === 1 ? "booking" : "bookings"} ${verb}`;
    return skipped.length
      ? { status: "error", message: `${message}; ${skipped.length} skipped (this step is not possible from their status): ${skipped.join(", ")}` }
      : { status: "ok", message };
  } catch (error) {
    if (error instanceof AdminApiError) return { status: "error", message: error.message };
    throw error;
  }
}

export async function deleteBooking(reference: string): Promise<ActionState> {
  const result = await attempt(() => adminApi(`/bookings/${encodeURIComponent(reference)}`, { method: "DELETE" }), "Deleted");
  if (result.status === "ok") {
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
  }
  return result;
}

// --- site settings -------------------------------------------------------------------

export async function saveSettings(changes: { copy_protection?: boolean }): Promise<ActionState> {
  const result = await attempt(() => adminApi("/settings", { method: "PUT", body: JSON.stringify(changes) }), "Saved: the website updates within a minute");
  revalidatePath("/admin/settings");
  return result;
}
