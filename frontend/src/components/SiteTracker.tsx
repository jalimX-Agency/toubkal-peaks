"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { locales } from "@/i18n/config";
import { currentChannel } from "@/lib/channel";
import { HUBS } from "@/lib/hubs";

type Kind = "visit" | "whatsapp" | "phone" | "email";

const VISIT_KEY = "tp-visit";
const HUB_PATHS = HUBS.map((h) => h.path);

function device(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  return /Mobi|iPhone|Android/i.test(ua) ? "mobile" : "desktop";
}

/** The trip's address ending, when the page is a trip page (category pages and the others have none). */
function tripSlug(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] && (locales as readonly string[]).includes(parts[0])) parts.shift();
  const hub = HUB_PATHS.find((p) => parts.join("/").startsWith(`${p}/`));
  if (!hub) return undefined;
  const rest = parts.join("/").slice(hub.length + 1).split("/");
  return rest.length === 1 && /^[a-z0-9-]+$/.test(rest[0]) ? rest[0] : undefined;
}

function send(kind: Kind) {
  const pathname = window.location.pathname;
  const lang = pathname.split("/")[1];
  const payload = JSON.stringify({
    event: kind,
    page: pathname,
    tour_slug: tripSlug(pathname),
    locale: (locales as readonly string[]).includes(lang) ? lang : "en",
    channel: currentChannel(),
    device: device(),
  });
  const blob = new Blob([payload], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  }
}

/**
 * Anonymous counts for the admin dashboard: one visit per browser session and every click on a WhatsApp, phone or
 * email link. No cookie and no identifier: the page, the language, the channel and the kind of device only.
 * Works whatever the cookie banner choice (it counts, it does not follow anyone).
 */
export function SiteTracker() {
  const pathname = usePathname();

  // one visit per session, counted on its first page
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(VISIT_KEY)) return;
      window.sessionStorage.setItem(VISIT_KEY, "1");
    } catch {
      return;
    }
    send("visit");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com|wa\.link)\//.test(href)) send("whatsapp");
      else if (href.startsWith("tel:")) send("phone");
      else if (href.startsWith("mailto:")) send("email");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
