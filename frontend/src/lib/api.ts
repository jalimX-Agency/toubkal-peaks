import { cacheLife, cacheTag } from "next/cache";
import type { Category, Paginated, ReviewSummary, TourCard } from "@/lib/types";

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
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
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

export async function getReviewSummary(): Promise<ReviewSummary> {
  "use cache";
  const res = await cachedRead<{ summary?: ReviewSummary }>("reviews", "/reviews?per_page=1", {});
  return res.summary ?? { count: 0, average: null };
}
