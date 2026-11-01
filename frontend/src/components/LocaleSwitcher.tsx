"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { localeNames, locales, localePath, stripLocale, type Locale } from "@/i18n/config";

type Props = { current: Locale; label: string; className?: string; tone?: "dark" | "light"; variant?: "links" | "select" };

/** A compact dropdown (globe, language code, chevron) for the navigation bar, where four links take too much room. */
function Dropdown({ current, label, className = "", tone = "dark", pathname }: Props & { pathname: string }) {
  const router = useRouter();
  const color = tone === "dark" ? "text-navy hover:text-gold" : "text-white hover:text-gold-light";
  return (
    <label className={`relative flex items-center ${color} ${className}`}>
      <span className="sr-only">{label}</span>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-2 h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <select
        value={current}
        onChange={(e) => router.push(localePath(e.target.value as Locale, pathname))}
        className="w-[5.25rem] cursor-pointer appearance-none rounded-sm border border-current/30 bg-transparent py-1.5 pl-8 pr-6 text-[0.8rem] font-semibold tracking-wider text-transparent transition-colors focus-visible:outline-2 focus-visible:outline-gold"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale} lang={locale} className="bg-white text-navy">
            {locale.toUpperCase()} · {localeNames[locale]}
          </option>
        ))}
      </select>
      {/* the closed select is as narrow as the code: its own text is hidden and the code drawn over it */}
      <span aria-hidden="true" className="pointer-events-none absolute left-8 text-[0.8rem] font-semibold tracking-wider">{current.toUpperCase()}</span>
      <svg viewBox="0 0 12 12" className="pointer-events-none absolute right-2.5 h-3 w-3" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2.5 4.5 6 8l3.5-3.5" />
      </svg>
    </label>
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
