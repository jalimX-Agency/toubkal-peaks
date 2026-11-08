import { headers } from "next/headers";
import { ORIGIN_HEADERS } from "@/lib/origin";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|curl|wget|python|axios|go-http/i;

/**
 * Anonymous visit and contact-click counts: the browser sends them here (same site, no CORS) and this server hands
 * them to the API. The country comes from the host's own header; the visitor's address is used only for the
 * API's flood limit and is never stored. Robots are not counted. Always answers 204: counting must never disturb a page.
 */
export async function POST(request: Request) {
  const h = await headers();
  if (BOT.test(h.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
    const country = h.get("x-vercel-ip-country");
    const pick = (k: string) => (typeof body[k] === "string" ? (body[k] as string) : undefined);
    await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "ToubkalPeaksWeb/1.0 (+https://toubkal-peaks.com)",
        ...ORIGIN_HEADERS,
        ...(ip ? { "X-Client-IP": ip } : {}),
      },
      body: JSON.stringify({
        event: pick("event"),
        page: pick("page"),
        tour_slug: pick("tour_slug") ?? null,
        locale: pick("locale") ?? null,
        channel: pick("channel") ?? null,
        device: pick("device") ?? null,
        country: country && /^[A-Za-z]{2}$/.test(country) ? country : null,
      }),
      cache: "no-store",
    });
  } catch {
    // nothing to do: a lost count is not worth an error
  }
  return new Response(null, { status: 204 });
}
