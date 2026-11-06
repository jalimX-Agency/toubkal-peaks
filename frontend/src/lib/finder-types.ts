/** Trip types of the filters, in menu order: the trek sub-categories, then the other hubs. Shared by the server pages and the client filter. */
export const TYPES = [
  { key: "toubkal", category: "treks.toubkal" },
  { key: "atlas", category: "treks.atlas-valleys-villages" },
  { key: "regional", category: "treks.regional-treks" },
  { key: "sahara", category: "sahara-desert-tours" },
  { key: "cities", category: "morocco-tours" },
  { key: "dayTrips", category: "day-trips-from-marrakech" },
] as const;

export type TripType = (typeof TYPES)[number];

/** The three trek sub-categories, for the trek pages. */
export const TREK_TYPES: readonly TripType[] = TYPES.filter((t) => t.category.startsWith("treks."));
