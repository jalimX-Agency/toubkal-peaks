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

export interface ReviewSummary {
  count: number;
  average: number | null;
}
