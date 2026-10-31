// Server only (next/headers): imported by server components and server actions, never by the browser.
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

// ADMIN_API_URL lets a local admin talk to a local API while the public pages read production.
const API_URL = process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/** The team member's API token lives in an httpOnly cookie on this domain only; the browser never reads it. */
export const SESSION_COOKIE = "tp_admin";
export const SESSION_DAYS = 7;

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

/**
 * The API host sometimes refuses a request instead of answering it (429, 403, 503, or its HTML
 * "Security Verification" page with a 200). Reads are tried again, waiting a little longer each time;
 * writes are not repeated (they may have been applied), they report the refusal instead.
 */
const RETRY_STATUSES = [403, 429, 503];
const RETRY_DELAYS_MS = [700, 2000, 4500];
const isJson = (res: Response) => (res.headers.get("content-type") ?? "").includes("json");
const refused = (res: Response) => RETRY_STATUSES.includes(res.status) || (res.ok && !isJson(res));

async function call(path: string, init: RequestInit & { token?: string | null } = {}): Promise<Response> {
  const { token, ...rest } = init;
  const method = (rest.method ?? "GET").toUpperCase();
  const send = () =>
    fetch(`${API_URL}/admin${path}`, {
      ...rest,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        Accept: "application/json",
        // a FormData body (file upload) sets its own multipart content type
        ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(rest.headers ?? {}),
      },
    });

  let res = await send();
  if (method !== "GET") return res;
  for (const delay of RETRY_DELAYS_MS) {
    if (!refused(res)) break;
    await res.arrayBuffer().catch(() => undefined);
    await new Promise((resolve) => setTimeout(resolve, delay));
    res = await send();
  }
  return res;
}

/**
 * Calls the admin API as the signed-in team member. An expired or revoked session sends the
 * person back to the sign-in page; validation errors come back as AdminApiError with field errors.
 */
export async function adminApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  const res = await call(path, { ...init, token });
  if (res.status === 401) redirect("/admin/login?expired=1");
  if (refused(res)) throw new AdminApiError(503, "The server is busy (its security check refused the request). Try again in a moment.");
  const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
  if (!res.ok) throw new AdminApiError(res.status, body.message ?? res.statusText, body.errors);
  return body as T;
}

/** Sign-in happens without a session. */
export async function adminLogin(email: string, password: string) {
  const res = await call("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  const body = (await res.json().catch(() => ({}))) as { token?: string; message?: string; errors?: Record<string, string[]> };
  if (!res.ok || !body.token) throw new AdminApiError(res.status, body.message ?? "Sign-in failed", body.errors);
  return body as { token: string; user: import("./types").AdminUser };
}

/** The signed-in member, fetched once per request (the layout and the page both need it). */
export const currentUser = cache(() => adminApi<{ user: import("./types").AdminUser }>("/auth/me").then((r) => r.user));
