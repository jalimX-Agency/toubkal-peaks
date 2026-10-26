export const locales = ["en", "fr", "es", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Public URL path of a page in a locale: English has no prefix (/treks), others do (/fr/treks). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  if (locale === defaultLocale) return clean || "/";
  return `/${locale}${clean}`;
}

/** Removes a leading locale segment from a browser pathname: /fr/treks -> /treks */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return hasLocale(first ?? "") ? `/${rest.join("/")}` : pathname || "/";
}
