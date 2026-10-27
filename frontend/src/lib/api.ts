import { cacheLife, cacheTag } from "next/cache";
import type { Category, Paginated, Review, ReviewSummary, TourCard, TourDetail } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    // a clear user agent: the host's firewall blocks some generic ones, and this one can be allow-listed
    headers: { Accept: "application/json", "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, (body as { message?: string })?.message ?? res.statusText, body);
  }
  return (await res.json()) as T;
}

/**
 * Cached read helpers. A failing API must not break the build or a page: they return an empty
 * result and keep it for only a few seconds so the next request tries again.
 */
async function cachedRead<T>(tag: string, path: string, empty: T): Promise<T> {
  cacheTag(tag);
  try {
    const data = await request<T>(path);
    cacheLife("minutes");
    return data;
  } catch (error) {
    console.error(`[api] ${path} failed:`, error instanceof Error ? error.message : error);
    cacheLife("seconds");
    return empty;
  }
}

export async function getCategories(locale: string): Promise<Category[]> {
  "use cache";
  const res = await cachedRead<{ data: Category[] }>("categories", `/categories?locale=${locale}`, { data: [] });
  return res.data;
}

export async function getTours(params: { locale: string; category?: string; perPage?: number }): Promise<Paginated<TourCard>> {
  "use cache";
  const query = new URLSearchParams({ locale: params.locale, per_page: String(params.perPage ?? 24) });
  if (params.category) query.set("category", params.category);
  return cachedRead<Paginated<TourCard>>("tours", `/tours?${query}`, { data: [] });
}

export async function getReviews(perPage = 6): Promise<{ data: Review[]; summary: ReviewSummary }> {
  "use cache";
  const res = await cachedRead<{ data?: Review[]; summary?: ReviewSummary }>("reviews", `/reviews?per_page=${perPage}`, {});
  return { data: res.data ?? [], summary: res.summary ?? { count: 0, average: null } };
}

/** One tour by its URL slug, or null when it does not exist (or the API cannot be reached). */
export async function getTour(slug: string, locale: string): Promise<TourDetail | null> {
  "use cache";
  cacheTag(`tour:${slug}`);
  const res = await cachedRead<{ data?: TourDetail }>("tours", `/tours/${encodeURIComponent(slug)}?locale=${locale}`, {});
  return res.data ?? null;
}

/** Paths of every published tour, used to prerender the tour pages. */
export async function getTourPaths(locale: string): Promise<string[]> {
  "use cache";
  const res = await getTours({ locale, perPage: 60 });
  return res.data.map((t) => t.path);
}
