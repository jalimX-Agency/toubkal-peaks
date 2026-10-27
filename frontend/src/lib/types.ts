/** Shapes returned by the Laravel API (api/v1). */

export interface ApiImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface TourCard {
  id: number;
  slug: string;
  path: string;
  title: string;
  summary: string | null;
  locale: string;
  category: { key: string; name: string | null };
  duration_days: number | null;
  duration_nights: number | null;
  difficulty: string | null;
  max_altitude_m: number | null;
  price_mode: "tiers" | "on_request";
  from_price: number | null;
  currency: string;
  price_basis: string;
  is_featured: boolean;
  hero: ApiImage | null;
}

export interface Category {
  key: string;
  slug: string | null;
  path: string;
  name: string | null;
  intro: string | null;
  seo: { title: string | null; description: string | null };
  tours_count: number;
  children?: Category[];
}

export interface Paginated<T> {
  data: T[];
  meta?: { total: number; current_page: number; last_page: number };
}

export interface Review {
  id: number;
  source: string;
  author: string;
  country: string | null;
  rating: number;
  title: string | null;
  body: string;
  language: string | null;
  date: string | null;
  url: string | null;
  tour_id: number | null;
}

export interface ReviewSummary {
  count: number;
  average: number | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  /** e.g. { distance: "12 km", elevation_gain: "+1,450 m" }; the API sends [] when a day has none */
  stats: Record<string, string> | [];
  accommodation: string | null;
  body: string[];
}

export interface PriceTier {
  min_pax: number;
  max_pax: number | null;
  price_per_person: number | null;
}

export interface TourDetail {
  id: number;
  slug: string;
  path: string;
  title: string;
  /** language of the content actually returned (English until a translation exists) */
  locale: string;
  category: { key: string; name: string | null; path: string };
  duration_days: number | null;
  duration_nights: number | null;
  difficulty: string | null;
  max_altitude_m: number | null;
  summary: string | null;
  highlights: string[];
  facts: Record<string, string> | [];
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  packing: { group: string; items: string[] }[];
  upgrades: string[];
  pricing: { mode: "tiers" | "on_request"; currency: string; basis: string; from_price: number | null; tiers: PriceTier[] };
  images: { hero: ApiImage | null; gallery: ApiImage[] };
  reviews: { summary: ReviewSummary; latest: Review[] };
  related: TourCard[];
  seo: { title: string; description: string };
  alternates: { locale: string; path: string }[];
  updated_at: string | null;
}
