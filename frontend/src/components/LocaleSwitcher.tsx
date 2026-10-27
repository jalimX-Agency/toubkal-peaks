"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { localeNames, locales, localePath, stripLocale, type Locale } from "@/i18n/config";

type Props = { current: Locale; label: string; className?: string; tone?: "dark" | "light" };

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
  return <Links {...props} pathname={stripLocale(usePathname() || "/")} />;
}

/**
 * Same page in the other languages: EN FR ES DE. The current URL is only known at request time, so the
 * prerendered shell links to each language's home page and the real links stream in right after.
 */
export function LocaleSwitcher(props: Props) {
  return (
    <Suspense fallback={<Links {...props} pathname="/" />}>
      <CurrentPageLinks {...props} />
    </Suspense>
  );
}
