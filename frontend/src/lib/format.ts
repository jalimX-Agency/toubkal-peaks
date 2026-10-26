import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { TourCard } from "@/lib/types";

export function formatPrice(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDuration(tour: Pick<TourCard, "duration_days">, dict: Dictionary["rail"]): string | null {
  const days = tour.duration_days;
  if (!days) return null;
  return `${days} ${days === 1 ? dict.day : dict.days}`;
}

export function formatDifficulty(value: string | null, dict: Dictionary["rail"]): string | null {
  if (!value) return null;
  return dict.difficulty[value as keyof Dictionary["rail"]["difficulty"]] ?? null;
}
