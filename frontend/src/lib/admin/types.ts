/** Shapes returned by the admin API (api/v1/admin). */

export type BookingStatus = "pending" | "confirmed" | "paid" | "completed" | "cancelled";
export type ReviewStatus = "pending" | "published" | "hidden";
export type TourStatus = "draft" | "published" | "archived";
export type TranslationStatus = "source" | "machine" | "reviewed" | null;
export type AdminLocale = "en" | "fr" | "es" | "de";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  created_at: string | null;
}

export interface BookingSummary {
  reference: string;
  status: BookingStatus;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  tour_title: string | null;
  start_date: string | null;
  adults: number;
  children: number;
  total_price: number | null;
  currency: string;
  locale: string;
  source: string;
  created_at: string | null;
}

export interface BookingDetail extends BookingSummary {
  first_name: string;
  last_name: string;
  tour_id: number | null;
  tour_slug: string | null;
  end_date: string | null;
  price_per_person: number | null;
  deposit_amount: number | null;
  paid_amount: number;
  balance_due: number | null;
  special_requests: string | null;
  admin_notes: string | null;
  next_statuses: BookingStatus[];
  history: { from: string | null; to: string; note: string | null; user: string | null; at: string | null }[];
  updated_at: string | null;
}

export interface Paged<T, C extends string = string> {
  data: T[];
  meta: { total: number; current_page: number; last_page: number };
  counts: Record<C, number>;
}

export interface TourRow {
  id: number;
  title: string | null;
  category: string | null;
  status: TourStatus;
  duration_days: number | null;
  price_mode: "tiers" | "on_request";
  from_price: number | null;
  currency: string;
  price_reviewed: boolean;
  is_featured: boolean;
  translations: Record<AdminLocale, TranslationStatus>;
  hero: string | null;
  updated_at: string | null;
}

export interface ItineraryDayInput {
  day: number;
  title: string;
  stats: Record<string, string> | [] | null;
  accommodation: string | null;
  body: string[] | null;
}

export interface TourContent {
  slug: string;
  title: string;
  summary: string | null;
  highlights: string[] | null;
  facts: Record<string, string> | [] | null;
  itinerary: ItineraryDayInput[] | null;
  included: string[] | null;
  excluded: string[] | null;
  packing: { group: string; items: string[] }[] | null;
  upgrades: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  translation_status: TranslationStatus;
  updated_at?: string | null;
}

export interface TourDetail {
  id: number;
  category: string | null;
  status: TourStatus;
  duration_days: number | null;
  duration_nights: number | null;
  difficulty: string | null;
  max_altitude_m: number | null;
  group_min: number | null;
  group_max: number | null;
  price_mode: "tiers" | "on_request";
  currency: string;
  is_featured: boolean;
  sort_order: number;
  price_reviewed_at: string | null;
  published_at: string | null;
  hero: string | null;
  images: TripImage[];
  paths: Record<AdminLocale, string | null>;
  prices: { min_pax: number; max_pax: number | null; price_per_person: number | null }[];
  translations: Record<AdminLocale, TourContent | null>;
  updated_at: string | null;
}

/** A trip photo (or a library photo when is_main is absent). */
export interface TripImage {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
  size: number | null;
  alt: Partial<Record<AdminLocale, string>>;
  is_main?: boolean;
}

export interface AdminReview {
  id: number;
  source: string;
  author_name: string;
  author_country: string | null;
  rating: number;
  title: string | null;
  body: string;
  language: string | null;
  reviewed_at: string | null;
  url: string | null;
  tour_id: number | null;
  tour_title: string | null;
  status: ReviewStatus;
  is_featured: boolean;
  created_at: string | null;
}

export interface DashboardData {
  stats: {
    pending_bookings: number;
    new_this_week: number;
    confirmed_this_month: number;
    revenue_this_month: number;
    pending_reviews: number;
    published_tours: number;
    prices_to_check: number;
    translations_to_review: number;
  };
  recent: DashboardRow[];
  upcoming: DashboardRow[];
}

export interface DashboardRow {
  reference: string;
  status: BookingStatus;
  name: string;
  tour_title: string | null;
  start_date: string | null;
  guests: number;
  total_price: number | null;
  currency: string;
  created_at: string | null;
}

/** A person on the website's About page; texts per language (en is required). */
export interface AdminTeamMember {
  id: number;
  name: string;
  role: Partial<Record<AdminLocale, string>>;
  bio: Partial<Record<AdminLocale, string[]>>;
  photo_alt: Partial<Record<AdminLocale, string>>;
  photo: { url: string; width: number | null; height: number | null } | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string | null;
}

/** Result of a form's server action. */
export type ActionState =
  | { status: "idle" }
  | { status: "ok"; message?: string }
  | { status: "error"; message: string; errors?: Record<string, string[]> };
