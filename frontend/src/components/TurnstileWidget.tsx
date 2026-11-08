"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;

/** Loads Cloudflare's script once, whichever form asks first. */
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = SCRIPT;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => {
      loading = null;
      reject(new Error("Turnstile could not be loaded"));
    };
    document.head.appendChild(tag);
  });
  return loading;
}

/**
 * "Are you a person?" check of the booking forms (Cloudflare Turnstile). Usually invisible: it asks for a click only when
 * Cloudflare is unsure. The token goes into a hidden `turnstile` field (and to `onToken`, for forms built in code); the
 * server checks it. Change `resetKey` after a failed send: a token can be used once.
 */
export function TurnstileWidget({ lang, onToken, resetKey = 0, className = "" }: { lang: string; onToken?: (token: string) => void; resetKey?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  useEffect(() => {
    callback.current = onToken;
  });

  useEffect(() => {
    let gone = false;
    const set = (token: string) => {
      if (input.current) input.current.value = token;
      callback.current?.(token);
    };
    loadScript()
      .then(() => {
        if (gone || !box.current || !window.turnstile || widget.current) return;
        widget.current = window.turnstile.render(box.current, {
          sitekey: site.turnstileSiteKey,
          language: lang,
          theme: "light",
          callback: set,
          "expired-callback": () => set(""),
          "error-callback": () => set(""),
        });
      })
      .catch(() => set(""));
    return () => {
      gone = true;
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [lang]);

  useEffect(() => {
    if (resetKey > 0 && widget.current) {
      if (input.current) input.current.value = "";
      callback.current?.("");
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey]);

  if (!site.turnstileSiteKey) return null;
  return (
    <div className={className}>
      <div ref={box} />
      <input ref={input} type="hidden" name="turnstile" defaultValue="" />
    </div>
  );
}
