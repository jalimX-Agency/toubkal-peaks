"use client";

import { useActionState, useState } from "react";
import { submitBooking, type BookingState } from "@/app/actions/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatPrice } from "@/lib/format";
import type { PriceTier } from "@/lib/types";

function pricePerPerson(tiers: PriceTier[], people: number): number | null {
  const tier = tiers.find((t) => people >= t.min_pax && (t.max_pax === null || people <= t.max_pax));
  return tier?.price_per_person ?? null;
}

/**
 * Booking request for one trip. Nothing is paid here: the request is stored as "pending" and the team
 * answers by email. The estimate uses the same per-person tiers as the price card.
 */
export function BookingForm({
  lang,
  dict,
  tourId,
  tiers,
  currency,
}: {
  lang: Locale;
  dict: Dictionary["booking"];
  tourId?: number;
  tiers: PriceTier[];
  currency: string;
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(submitBooking, { status: "idle" });
  const values = state.status === "invalid" || state.status === "error" ? state.values : {};
  const errors = state.status === "invalid" ? state.errors : {};
  const [adults, setAdults] = useState(Number(values.adults ?? 2) || 2);
  const [children, setChildren] = useState(Number(values.children ?? 0) || 0);
  const people = adults + children;
  const perPerson = pricePerPerson(tiers, people);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-sm border border-atlas/30 bg-white p-8">
        <p className="heading text-2xl">{dict.successTitle}</p>
        <p className="mt-3 text-ink">{dict.successText.replace("{reference}", state.reference)}</p>
      </div>
    );
  }

  const field = "mt-1.5 w-full rounded-sm border border-line bg-white px-3.5 py-3 text-ink outline-none transition-colors focus:border-navy aria-[invalid=true]:border-sahara";
  const label = "text-sm font-medium text-navy";
  const err = (name: string) =>
    errors[name]?.[0] && (
      <p id={`${name}-error`} className="mt-1 text-xs text-sahara">
        {/* the API answers in English; other languages get a short message of their own */}
        {lang === "en" ? errors[name][0] : dict.check}
      </p>
    );
  const invalid = (name: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `${name}-error` : undefined });

  return (
    <form action={action} className="relative grid gap-5 rounded-sm border border-line bg-white p-6 md:grid-cols-2 md:p-8" noValidate>
      {tourId && <input type="hidden" name="tour_id" value={tourId} />}
      <input type="hidden" name="locale" value={lang} />
      {/* honeypot: hidden from people, bots fill it and get a silent fake success */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "invalid" && <p role="alert" className="text-sm font-medium text-sahara md:col-span-2">{dict.invalid}</p>}
      {state.status === "error" && <p role="alert" className="text-sm font-medium text-sahara md:col-span-2">{dict.error}</p>}

      <div>
        <label htmlFor="first_name" className={label}>{dict.firstName} *</label>
        <input id="first_name" name="first_name" required autoComplete="given-name" defaultValue={values.first_name} className={field} {...invalid("first_name")} />
        {err("first_name")}
      </div>
      <div>
        <label htmlFor="last_name" className={label}>{dict.lastName} *</label>
        <input id="last_name" name="last_name" required autoComplete="family-name" defaultValue={values.last_name} className={field} {...invalid("last_name")} />
        {err("last_name")}
      </div>
      <div>
        <label htmlFor="email" className={label}>{dict.email} *</label>
        <input id="email" name="email" type="email" required autoComplete="email" defaultValue={values.email} className={field} {...invalid("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="phone" className={label}>{dict.phone}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={values.phone} className={field} {...invalid("phone")} />
        {err("phone")}
      </div>
      <div>
        <label htmlFor="country" className={label}>{dict.country}</label>
        <input id="country" name="country" autoComplete="country-name" defaultValue={values.country} className={field} {...invalid("country")} />
        {err("country")}
      </div>
      <div>
        <label htmlFor="start_date" className={label}>{dict.date}</label>
        <input id="start_date" name="start_date" type="date" defaultValue={values.start_date} className={field} {...invalid("start_date")} />
        {err("start_date")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="adults" className={label}>{dict.adults} *</label>
          <input id="adults" name="adults" type="number" min={1} max={30} required value={adults} onChange={(e) => setAdults(Math.max(1, Number(e.target.value) || 1))} className={field} {...invalid("adults")} />
          {err("adults")}
        </div>
        <div>
          <label htmlFor="children" className={label}>{dict.children}</label>
          <input id="children" name="children" type="number" min={0} max={30} value={children} onChange={(e) => setChildren(Math.max(0, Number(e.target.value) || 0))} className={field} {...invalid("children")} />
          {err("children")}
        </div>
      </div>
      <div className="flex items-end">
        {perPerson !== null && (
          <p className="w-full rounded-sm bg-sand/70 px-4 py-3 text-sm text-muted">
            {dict.estimate}:{" "}
            <span className="font-semibold text-navy">{formatPrice(perPerson * people, currency, lang)}</span>{" "}
            <span className="mono">({people} × {formatPrice(perPerson, currency, lang)})</span>
          </p>
        )}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="special_requests" className={label}>{dict.message}</label>
        <textarea id="special_requests" name="special_requests" rows={4} maxLength={2000} defaultValue={values.special_requests} className={field} {...invalid("special_requests")} />
        {err("special_requests")}
      </div>
      <div className="md:col-span-2">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--navy)]" {...invalid("consent")} />
          <span>{dict.consent} *</span>
        </label>
        {err("consent")}
      </div>
      <div className="md:col-span-2">
        <button type="submit" disabled={pending} className="btn-gold w-full disabled:opacity-60 md:w-auto">
          {pending ? dict.sending : dict.submit}
        </button>
      </div>
    </form>
  );
}
