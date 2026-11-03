"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { track } from "@/lib/analytics";
import { site } from "@/lib/site";

const KEY = "tp-consent";
const CHANGE = "tp-consent-change";
const OPEN = "tp-cookie-settings";

type Consent = "granted" | "denied" | "unset" | "loading";

function read(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}
/** Deletes Google's cookies (_ga, _ga_XXXX, _gid, _gat) on this host and its parent domains. */
function clearGoogleCookies() {
  const names = document.cookie.split(";").map((c) => c.trim().split("=")[0]).filter((n) => /^_(ga|gid|gat)/.test(n));
  const parts = window.location.hostname.split(".");
  const domains = ["", ...parts.map((_, i) => `.${parts.slice(i).join(".")}`).filter((d) => d.includes("."))];
  for (const name of names) {
    for (const domain of domains) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ""}`;
  }
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange);
  return () => window.removeEventListener(CHANGE, onChange);
};

/**
 * Analytics and advertising measurement (Google), loaded only after the visitor accepts. Nothing is
 * set or sent before: the banner offers "Accept" and "Decline" with the same weight, and "Cookie settings"
 * in the footer reopens it. While the choice is not known (server render) nothing is shown.
 */
export function Analytics({ lang, dict }: { lang: Locale; dict: Dictionary["cookies"] }) {
  const consent = useSyncExternalStore(subscribe, read, (): Consent => "loading");
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN, open);
    return () => window.removeEventListener(OPEN, open);
  }, []);

  // calls to WhatsApp, phone and email, only while analytics is on
  useEffect(() => {
    if (consent !== "granted") return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const href = link?.getAttribute("href") ?? "";
      if (/^https:\/\/wa\.me\//.test(href)) track("click_whatsapp");
      else if (href.startsWith("tel:")) track("click_phone");
      else if (href.startsWith("mailto:")) track("click_email");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

  const choose = (value: "granted" | "denied") => {
    const was = read();
    try {
      window.localStorage.setItem(KEY, value);
    } catch {}
    setReopened(false);
    window.dispatchEvent(new Event(CHANGE));
    // withdrawing a consent that was given: reload so that the Google scripts are gone
    if (was === "granted" && value === "denied") {
      clearGoogleCookies();
      window.location.reload();
    }
  };

  const visible = consent === "unset" || (reopened && consent !== "loading");

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.analyticsId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', { ad_storage: 'granted', analytics_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' });
            gtag('js', new Date());
            gtag('config', '${site.analyticsId}');
          `}</Script>
        </>
      )}
      {visible && (
        <div role="dialog" aria-label={dict.title} className="fixed inset-x-3 bottom-3 z-[60] max-w-md rounded-lg border border-line bg-white p-5 shadow-[0_12px_40px_rgba(2,46,85,0.22)] md:bottom-6 md:left-6 md:right-auto">
          <p className="font-display text-lg font-semibold text-navy">{dict.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {dict.text}{" "}
            <Link href={localePath(lang, "/privacy-policy")} className="font-semibold text-navy underline decoration-gold underline-offset-2">{dict.privacy}</Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => choose("denied")} className="rounded-md border border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-sand">{dict.decline}</button>
            <button type="button" onClick={() => choose("granted")} className="rounded-md border border-navy bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep">{dict.accept}</button>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer link that reopens the cookie banner. */
export function CookieSettingsButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN))} className={className}>
      {label}
    </button>
  );
}
