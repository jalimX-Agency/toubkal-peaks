import type { Dictionary } from "@/i18n/dictionaries/en";

/** Category hubs and their URL paths (same in every language for now). Keys match the API category keys. */
export const HUBS = [
  { key: "treks", path: "treks", parent: null, tab: "all" },
  { key: "treks.toubkal", path: "treks/toubkal", parent: "treks", tab: "toubkal" },
  { key: "treks.atlas-valleys-villages", path: "treks/atlas-valleys-villages", parent: "treks", tab: "atlas" },
  { key: "treks.regional-treks", path: "treks/regional-treks", parent: "treks", tab: "regional" },
  { key: "sahara-desert-tours", path: "sahara-desert-tours", parent: null, tab: "sahara" },
  { key: "morocco-tours", path: "morocco-tours", parent: null, tab: "cities" },
  { key: "day-trips-from-marrakech", path: "day-trips-from-marrakech", parent: null, tab: "dayTrips" },
] as const;

export type Hub = (typeof HUBS)[number];
export type HubKey = Hub["key"];

export const hubByPath = (path: string) => HUBS.find((h) => h.path === path);
export const hubByKey = (key: string) => HUBS.find((h) => h.key === key);

/** Localised hub title, falling back to the API's (English) name for categories we do not know. */
export function hubTitle(key: string, dict: Dictionary, fallback?: string | null): string {
  return dict.hubs[key as HubKey]?.title ?? fallback ?? key;
}
