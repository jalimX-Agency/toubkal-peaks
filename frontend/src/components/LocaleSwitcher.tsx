"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { localeNames, locales, localePath, stripLocale, type Locale } from "@/i18n/config";

type Props = { current: Locale; label: string; className?: string; tone?: "dark" | "light"; variant?: "links" | "select" };

/**
 * A compact menu for the navigation bar, where four links take too much room: a button (globe, current
 * language code, chevron) opening the list of languages in the style of the other menus. The entries are
 * ordinary links, so they work as such for crawlers and before the page is interactive.
 */
function Dropdown({ current, label, className = "", tone = "dark", pathname }: Props & { pathname: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const color = tone === "dark" ? "text-navy hover:text-gold" : "text-white hover:text-gold-light";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={box} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${label}: ${localeNames[current]}`}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-sm border border-current/30 px-2.5 py-1.5 text-[0.8rem] font-semibold tracking-wider transition-colors ${color}`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
        {current.toUpperCase()}
        <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-10 mt-2 min-w-40 rounded-sm border border-line bg-cream py-2 shadow-[0_12px_32px_rgba(2,46,85,0.14)]">
          {locales.map((locale) => (
            <li key={locale}>
              <Link
                href={localePath(locale, pathname)}
                hrefLang={locale}
                lang={locale}
                aria-current={locale === current ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-4 whitespace-nowrap px-4 py-2 text-[0.92rem] tracking-normal transition-colors hover:bg-sand hover:text-gold ${locale === current ? "font-semibold text-navy" : "text-navy"}`}
              >
                {localeNames[locale]}
                {locale === current && <span aria-hidden="true" className="text-gold">✓</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Links({ current, label, className = "", tone = "dark", pathname }: Props & { pathname: string }) {
  const idle = tone === "dark" ? "text-muted hover:text-navy" : "text-white/60 hover:text-white";
  const active = tone === "dark" ? "text-navy border-gold" : "text-white border-gold";

  return (
    <nav aria-label={label} className={`flex items-center gap-1 text-[0.8rem] font-semibold tracking-wider ${className}`}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={localePath(locale, pathname)}
          hrefLang={locale}
          lang={locale}
          title={localeNames[locale]}
          aria-current={locale === current ? "true" : undefined}
          className={`border-b-2 px-1.5 py-1 transition-colors ${locale === current ? active : `border-transparent ${idle}`}`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}

function CurrentPageLinks(props: Props) {
  const pathname = stripLocale(usePathname() || "/");
  return props.variant === "select" ? <Dropdown {...props} pathname={pathname} /> : <Links {...props} pathname={pathname} />;
}

/**
 * Same page in the other languages: EN FR ES DE. The current URL is only known at request time, so the
 * prerendered shell links to each language's home page and the real links stream in right after.
 */
export function LocaleSwitcher(props: Props) {
  return (
    <Suspense fallback={props.variant === "select" ? <Dropdown {...props} pathname="/" /> : <Links {...props} pathname="/" />}>
      <CurrentPageLinks {...props} />
    </Suspense>
  );
}
