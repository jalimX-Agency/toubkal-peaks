/**
 * Where a visitor came from, as one coarse label: kept for the visit in sessionStorage (no cookie, nothing that
 * identifies a person) and sent with the anonymous counts and with booking requests.
 */
export type Channel = "google_ads" | "google_organic" | "search" | "social" | "referral" | "direct";

const KEY = "tp-channel";
const SEARCH = /(^|\.)(bing|duckduckgo|yahoo|ecosia|yandex|baidu|qwant|brave)\./i;
const SOCIAL = /(^|\.)(facebook|instagram|t\.co|twitter|x\.com|linkedin|pinterest|youtube|tiktok|reddit|whatsapp|wa\.me|l\.wl\.co|lnkd\.in)(\.|$)/i;

function classify(): Channel {
  const params = new URLSearchParams(window.location.search);
  const medium = (params.get("utm_medium") ?? "").toLowerCase();
  const source = (params.get("utm_source") ?? "").toLowerCase();
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid") || ["cpc", "ppc", "paid", "paidsearch"].includes(medium)) return "google_ads";
  if (/(facebook|instagram|tiktok|linkedin|pinterest|twitter)/.test(source) || medium === "social") return "social";

  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {}
  if (!host || host === window.location.hostname || host.endsWith("toubkal-peaks.com") || host.endsWith("toubkalpeakstravel.com")) return "direct";
  if (/(^|\.)google\./i.test(host)) return "google_organic";
  if (SEARCH.test(host)) return "search";
  if (SOCIAL.test(host)) return "social";
  return "referral";
}

/** The visit's channel: worked out on the first page of the visit, then remembered for the rest of it. */
export function currentChannel(): Channel {
  try {
    const saved = window.sessionStorage.getItem(KEY) as Channel | null;
    if (saved) return saved;
    const channel = classify();
    window.sessionStorage.setItem(KEY, channel);
    return channel;
  } catch {
    return "direct";
  }
}
