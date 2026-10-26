"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeNames, locales, localePath, stripLocale, type Locale } from "@/i18n/config";

/** Same page in the other languages: EN FR ES DE. */
export function LocaleSwitcher({
  current,
  label,
  className = "",
  tone = "dark",
}: {
  current: Locale;
  label: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const pathname = stripLocale(usePathname() || "/");
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
