// Server only (next/headers): imported by server components and server actions, never by the browser.
import { cookies } from "next/headers";
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

async function call(path: string, init: RequestInit & { token?: string | null } = {}): Promise<Response> {
  const { token, ...rest } = init;
  return fetch(`${API_URL}/admin${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      // a FormData body (file upload) sets its own multipart content type
      ...(rest.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(rest.headers ?? {}),
    },
  });
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
