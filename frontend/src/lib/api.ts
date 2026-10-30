import { cacheLife, cacheTag } from "next/cache";
import type { Category, Paginated, Review, ReviewSummary, TeamMember, TourCard, TourDetail } from "@/lib/types";

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
 * is exactly what a build does. During the build, keep at most two requests in flight, started
 * 150 ms apart. Not at runtime: a visitor's page makes a few requests, and a shared queue makes one
 * "use cache" call wait on a promise of another, which Next.js rejects (the page fails with a 500).
 */
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";
const MAX_IN_FLIGHT = 2;
const SPACING_MS = 150;
let inFlight = 0;
let lastStart = 0;
const waiting: (() => void)[] = [];

async function throttled<T>(run: () => Promise<T>): Promise<T> {
  if (!IS_BUILD) return run();
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

/**
 * The host sometimes refuses a request instead of answering it: "too many requests" (429), "access
 * denied" (403), "unavailable" (503), or a 200 carrying its HTML "Security Verification" page instead of
 * JSON. Those are temporary: wait (as long as it asks, within reason) and try again, three times.
 */
const RETRY_STATUSES = [403, 429, 503];
const RETRY_DELAYS_MS = [1500, 4000, 8000];

const REQUEST_TIMEOUT_MS = 15_000;

const isJson = (res: Response) => (res.headers.get("content-type") ?? "").includes("json");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  for (let attempt = 0; ; attempt++) {
    res = await throttled(() =>
      fetch(`${API_URL}${path}`, {
        ...init,
        // A signal opts out of Next.js' fetch memoization: without it a retry gets the same (refused)
        // answer back, and two cached functions asking for the same URL share one promise, which
        // Next.js rejects inside "use cache" (the page fails with a 500, React error #441).
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        // a clear user agent: the host's firewall blocks some generic ones, and this one can be allow-listed
        headers: { Accept: "application/json", "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)", ...(init?.headers ?? {}) },
      }),
    );
    const refused = RETRY_STATUSES.includes(res.status) || (res.ok && !isJson(res));
    if (!refused || attempt >= RETRY_DELAYS_MS.length) break;
    const asked = Number(res.headers.get("retry-after")) * 1000;
    await res.arrayBuffer().catch(() => undefined); // drain the refused answer so the connection is released
    await new Promise((resolve) => setTimeout(resolve, Math.min(asked > 0 ? asked : RETRY_DELAYS_MS[attempt], 10000)));
  }
  if (res.ok && !isJson(res)) throw new ApiError(502, "The API answered with a web page (host security check) instead of data");
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(res.status, (body as { message?: string })?.message ?? res.statusText, body);
  }
  return (await res.json()) as T;
}

/**
 * How long a successful read is kept: served fresh for 5 minutes, refreshed in the background every
 * 30 minutes, and kept up to a week, so a page keeps showing its last good content while the API
 * refuses requests. Content edits do not wait: Laravel revalidates the matching tag at once.
 */
const KEEP = { stale: 300, revalidate: 1800, expire: 7 * 24 * 3600 };

/**
 * Cached read helpers. A failing API must not break the build or a page: they return an empty
 * result that is refreshed a minute later. (Next.js leaves caches expiring in under five minutes
 * out of the prerender, which would turn one failed request into a failed build.)
 */
async function cachedRead<T>(tag: string, path: string, empty: T): Promise<T> {
  cacheTag(tag);
  try {
    const data = await request<T>(path);
    cacheLife(KEEP);
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

/** The people on the About page, in the order set in the admin. */
export async function getTeam(locale: string): Promise<TeamMember[]> {
  "use cache";
  const res = await cachedRead<{ data: TeamMember[] }>("team", `/team?locale=${locale}`, { data: [] });
  return res.data;
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
    cacheLife(KEEP);
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

