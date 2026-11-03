/** Google Analytics 4: events are sent only after the visitor accepted the cookie banner (see components/Analytics.tsx). */
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** Sends an event if analytics is on (consent given); does nothing otherwise. */
export function track(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") window.gtag("event", event, params);
}
