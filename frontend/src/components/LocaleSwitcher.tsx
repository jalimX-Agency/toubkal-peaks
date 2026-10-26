"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, localePath, stripLocale, type Locale } from "@/i18n/config";

/** Same page in the other languages: EN FR ES DE. */
export function LocaleSwitcher({ current, label, className = "" }: { current: Locale; label: string; className?: string }) {
  const pathname = stripLocale(usePathname() || "/");
  return (
    <nav aria-label={label} className={`mono flex items-center gap-3 ${className}`}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={localePath(locale, pathname)}
          hrefLang={locale}
          lang={locale}
          title={localeNames[locale]}
          aria-current={locale === current ? "true" : undefined}
          className={locale === current ? "border-b border-terracotta text-ink" : "text-ink-soft transition-colors hover:text-terracotta"}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
