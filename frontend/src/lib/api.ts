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

/**
 * The host's firewall blocks an IP for a while after a burst of requests ("Access denied"), which
 * is exactly what a build does. Keep at most two requests in flight, started 150 ms apart.
 */
const MAX_IN_FLIGHT = 2;
const SPACING_MS = 150;
let inFlight = 0;
let lastStart = 0;
const waiting: (() => void)[] = [];

async function throttled<T>(run: () => Promise<T>): Promise<T> {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((resolve) => waiting.push(resolve));
  inFlight++;
  const wait = lastStart + SPACING_MS - Date.now();
  lastStart = Math.max(Date.now(), lastStart + SPACING_MS);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  try {
    return await run();
  } finally {
    inFlight--;
    waiting.shift()?.();
  }
}

/** "Too many requests" from the host: wait (as long as it asks, within reason) and try again, twice. */
const RETRY_STATUSES = [429, 503];
const RETRY_DELAYS_MS = [2000, 5000];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  for (let attempt = 0; ; attempt++) {
    res = await throttled(() =>
      fetch(`${API_URL}${path}`, {
        ...init,
        // a clear user agent: the host's firewall blocks some generic ones, and this one can be allow-listed
        headers: { Accept: "application/json", "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)", ...(init?.headers ?? {}) },
      }),
    );
    if (!RETRY_STATUSES.includes(res.status) || attempt >= RETRY_DELAYS_MS.length) break;
    const asked = Number(res.headers.get("retry-after")) * 1000;
    await new Promise((resolve) => setTimeout(resolve, Math.min(asked > 0 ? asked : RETRY_DELAYS_MS[attempt], 10000)));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, (body as { message?: string })?.message ?? res.statusText, body);
  }
  return (await res.json()) as T;
}

/**
 * Cached read helpers. A failing API must not break the build or a page: they return an empty
 * result that is refreshed a minute later. (Next.js leaves caches expiring in under five minutes
 * out of the prerender, which would turn one failed request into a failed build.)
 */
async function cachedRead<T>(tag: string, path: string, empty: T): Promise<T> {
  cacheTag(tag);
  try {
    const data = await request<T>(path);
    cacheLife("minutes");
    return data;
  } catch (error) {
    console.error(`[api] ${path} failed:`, describe(error));
    cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
    return empty;
  }
}

/** "fetch failed" alone hides the reason (DNS, refused, timeout, TLS...): add the cause. */
function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const cause = error.cause as { code?: string; message?: string } | undefined;
  return cause ? `${error.message} (${cause.code ?? cause.message})` : error.message;
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

/**
 * One tour by its URL slug, or null when the API says it does not exist. Any other failure (rate
 * limit, host security check, timeout) throws instead: the page then fails for this request and is
 * retried on the next one, rather than being cached and served as a "not found" page.
 */
export async function getTour(slug: string, locale: string): Promise<TourDetail | null> {
  "use cache";
  cacheTag("tours", `tour:${slug}`);
  try {
    const res = await request<{ data?: TourDetail }>(`/tours/${encodeURIComponent(slug)}?locale=${locale}`);
    cacheLife("minutes");
    return res.data ? withoutFillers(res.data) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      cacheLife("minutes");
      return null;
    }
    console.error(`[api] /tours/${slug} failed:`, describe(error));
    throw error;
  }
}

/** The imported content keeps "-", "." and empty strings as placeholders; they are never shown. */
const isFiller = (s: string) => /^[\s\-–—.·]*$/.test(s);
const clean = (list: string[]) => list.filter((s) => !isFiller(s));

function withoutFillers(tour: TourDetail): TourDetail {
  return {
    ...tour,
    highlights: clean(tour.highlights),
    included: clean(tour.included),
    excluded: clean(tour.excluded),
    upgrades: clean(tour.upgrades),
    itinerary: tour.itinerary.map((day) => ({ ...day, body: clean(day.body) })),
    packing: tour.packing
      .map((group) => ({ ...group, items: clean(group.items) }))
      .filter((group) => group.items.length > 0),
  };
}

