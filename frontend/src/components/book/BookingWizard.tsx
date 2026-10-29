"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getTripPricing, submitBooking } from "@/app/actions/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDuration, formatPrice } from "@/lib/format";
import { HUBS } from "@/lib/hubs";
import { whatsappLink } from "@/lib/site";
import type { PriceTier, TourCard, TourDetail } from "@/lib/types";

const STEPS = ["trip", "dates", "group", "prefs", "details", "review"] as const;
type Step = (typeof STEPS)[number];

type Draft = {
  tripId: number | null;
  custom: boolean;
  date: string;
  undecided: boolean;
  flexible: boolean;
  flex: "3" | "7" | "month";
  adults: number;
  children: number;
  accommodation: "standard" | "superior" | "luxury";
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  contactBy: "email" | "whatsapp" | "phone";
};

const EMPTY: Draft = {
  tripId: null, custom: false, date: "", undecided: false, flexible: false, flex: "3",
  adults: 2, children: 0, accommodation: "standard", notes: "",
  firstName: "", lastName: "", email: "", phone: "", country: "", contactBy: "email",
};

const STORAGE_KEY = "tp-booking-draft";
const FIELD_STEP: Record<string, Step> = {
  tour_id: "trip", start_date: "dates", adults: "group", children: "group", special_requests: "prefs",
  first_name: "details", last_name: "details", email: "details", phone: "details", country: "details", consent: "review",
};
// What the team reads in the request (in English, whatever the visitor's language).
const FLEX_EN = { "3": "± 3 days", "7": "± 1 week", month: "any time that month" } as const;

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pricePerPerson(tiers: PriceTier[], people: number): number | null {
  const tier = tiers.find((t) => people >= t.min_pax && (t.max_pax === null || people <= t.max_pax));
  return tier?.price_per_person ?? null;
}

type Props = {
  lang: Locale;
  tours: TourCard[];
  t: Dictionary["book"];
  tabs: Dictionary["tours"]["tabs"];
  toursDict: Dictionary["tours"];
  whatsappMessage: string;
};

function readDraft(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage blocked: the wizard simply starts empty
  }
}

/**
 * Reservation request in six short steps, built for phones first: one question group per screen,
 * a fixed bottom bar with the estimate and the next button, and a summary column on large screens.
 * Nothing is paid: the request is stored as pending and the team answers within 24 hours.
 * Rendered in the browser only (see BookingWizardLoader): a draft kept in sessionStorage survives a reload.
 */
export function BookingWizard({ lang, tours, t, tabs, toursDict, whatsappMessage }: Props) {
  const params = useSearchParams();
  const preset = params.get("trip");
  const presetTour = preset ? tours.find((x) => x.slug === preset || String(x.id) === preset) : undefined;

  const [draft, setDraft] = useState<Draft>(() => {
    let restored: Partial<Draft> = {};
    try {
      restored = JSON.parse(readDraft() ?? "{}");
    } catch {}
    return presetTour ? { ...EMPTY, ...restored, tripId: presetTour.id, custom: false } : { ...EMPTY, ...restored };
  });
  const [step, setStep] = useState(presetTour ? 1 : 0);
  const [reached, setReached] = useState(presetTour ? 1 : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; name: string } | null>(null);
  const [fetched, setFetched] = useState<{ slug: string; pricing: TourDetail["pricing"] | null } | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft]);

  const trip = useMemo(() => tours.find((x) => x.id === draft.tripId) ?? null, [tours, draft.tripId]);
  useEffect(() => {
    if (!trip) return;
    let live = true;
    getTripPricing(trip.slug, lang).then((p) => live && setFetched({ slug: trip.slug, pricing: p }));
    return () => {
      live = false;
    };
  }, [trip, lang]);
  // pricing of the trip currently selected (a previous trip's answer is ignored)
  const pricing = fetched && trip && fetched.slug === trip.slug ? fetched.pricing : null;

  const people = draft.adults + draft.children;
  const currency = pricing?.currency ?? trip?.currency ?? "EUR";
  const perPerson = pricing ? pricePerPerson(pricing.tiers, people) : null;
  const onRequest = (pricing?.mode ?? trip?.price_mode) === "on_request";
  const estimate = perPerson !== null ? perPerson * people : null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };

  function validate(s: Step): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === "trip" && !draft.tripId && !draft.custom) e.tripId = t.trip.required;
    if (s === "dates") {
      if (!draft.undecided && !draft.date) e.date = t.dates.required;
      else if (!draft.undecided && draft.date < today()) e.date = t.dates.past;
    }
    if (s === "details") {
      if (!draft.firstName.trim()) e.firstName = t.details.required;
      if (!draft.lastName.trim()) e.lastName = t.details.required;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) e.email = t.details.invalidEmail;
      if (draft.contactBy !== "email" && !draft.phone.trim()) e.phone = t.details.phoneRequired;
    }
    if (s === "review" && !consent) e.consent = t.review.consentRequired;
    return e;
  }

  function goTo(index: number) {
    setStep(index);
    setReached((r) => Math.max(r, index));
    setBanner(null);
    requestAnimationFrame(() => {
      headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      headingRef.current?.focus({ preventScroll: true });
    });
  }

  function next() {
    const e = validate(STEPS[step]);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    if (STEPS[step] === "review") submit();
    else goTo(step + 1);
  }

  function submit() {
    const lines = [
      draft.custom ? "Tailor-made trip" : null,
      draft.undecided ? "Dates: not decided yet" : draft.flexible ? `Dates flexible: ${FLEX_EN[draft.flex]}` : null,
      `Accommodation: ${draft.accommodation}`,
      `Preferred contact: ${draft.contactBy}`,
      draft.notes.trim() ? `\n${draft.notes.trim()}` : null,
    ].filter(Boolean);

    const form = new FormData();
    if (draft.tripId && !draft.custom) form.set("tour_id", String(draft.tripId));
    form.set("locale", lang);
    form.set("first_name", draft.firstName);
    form.set("last_name", draft.lastName);
    form.set("email", draft.email);
    form.set("phone", draft.phone);
    form.set("country", draft.country);
    if (!draft.undecided) form.set("start_date", draft.date);
    form.set("adults", String(draft.adults));
    form.set("children", String(draft.children));
    form.set("special_requests", lines.join("\n").slice(0, 2000));
    form.set("consent", "on");
    form.set("website", honeypot.current?.value ?? "");

    startTransition(async () => {
      const res = await submitBooking({ status: "idle" }, form);
      if (res.status === "success") {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {}
        setDone({ reference: res.reference, name: draft.firstName.trim() });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (res.status === "invalid") {
        const fieldErrors: Record<string, string> = {};
        const map: Record<string, string> = { first_name: "firstName", last_name: "lastName", start_date: "date", tour_id: "tripId", special_requests: "notes" };
        for (const [field, messages] of Object.entries(res.errors)) {
          fieldErrors[map[field] ?? field] = lang === "en" ? messages[0] : t.invalid;
        }
        setErrors(fieldErrors);
        const first = STEPS.findIndex((s) => Object.keys(res.errors).some((f) => FIELD_STEP[f] === s));
        if (first >= 0 && first !== step) goTo(first);
        setBanner(t.invalid);
        return;
      }
      setBanner(t.error);
    });
  }

  if (done) return <Success t={t} lang={lang} done={done} whatsappMessage={whatsappMessage} />;

  const current = STEPS[step];
  const travellers = [
    draft.adults === 1 ? t.review.adult : t.review.adults.replace("{n}", String(draft.adults)),
    draft.children > 0 ? (draft.children === 1 ? t.review.child : t.review.children.replace("{n}", String(draft.children))) : null,
  ].filter(Boolean).join(" · ");
  const dateText = draft.undecided || !draft.date
    ? t.review.noDate
    : `${new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(`${draft.date}T12:00:00`))}${draft.flexible ? ` (${t.review.flexible})` : ""}`;
  const tripTitle = draft.custom ? t.trip.custom : trip?.title ?? "—";
  const estimateText = estimate !== null ? formatPrice(estimate, currency, lang) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 md:px-8 md:pt-10 lg:grid lg:grid-cols-12 lg:gap-10 lg:pb-20">
      <div className="lg:col-span-8">
        {/* progress */}
        <div className="flex items-center justify-between gap-4">
          <p className="mono text-gold">{t.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(STEPS.length))}</p>
          <p className="text-sm font-semibold text-navy">{t.steps[current]}</p>
        </div>
        <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label={t.summary}>
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i <= reached && i !== step && goTo(i)}
                disabled={i > reached}
                aria-current={i === step ? "step" : undefined}
                aria-label={`${i + 1}. ${t.steps[s]}`}
                className={`block h-1.5 w-full rounded-full transition-colors ${i < step ? "bg-gold" : i === step ? "bg-navy" : i <= reached ? "bg-gold/40" : "bg-line"} disabled:cursor-default`}
              />
            </li>
          ))}
        </ol>

        <section className="mt-8" aria-labelledby="wizard-step">
          <h2 id="wizard-step" ref={headingRef} tabIndex={-1} className="heading scroll-mt-28 text-[clamp(1.6rem,3vw,2.2rem)] outline-none">
            {current === "trip" && t.trip.title}
            {current === "dates" && t.dates.title}
            {current === "group" && t.group.title}
            {current === "prefs" && t.prefs.title}
            {current === "details" && t.details.title}
            {current === "review" && t.review.title}
          </h2>

          {banner && (
            <p role="alert" className="mt-4 rounded-sm border border-sahara/30 bg-sahara/5 px-4 py-3 text-sm font-medium text-sahara">
              {banner}
            </p>
          )}

          <div className="mt-6">
            {current === "trip" && (
              <TripStep tours={tours} draft={draft} t={t} tabs={tabs} toursDict={toursDict} lang={lang} error={errors.tripId}
                onPick={(id) => { setDraft((d) => ({ ...d, tripId: id, custom: false })); setErrors({}); }}
                onCustom={() => { setDraft((d) => ({ ...d, tripId: null, custom: true })); setErrors({}); }} />
            )}

            {current === "dates" && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="f-date" className="text-sm font-medium text-navy">{t.dates.date}</label>
                  <input id="f-date" type="date" min={today()} value={draft.date} disabled={draft.undecided}
                    onChange={(e) => set("date", e.target.value)}
                    aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "e-date" : undefined}
                    className="mt-1.5 block w-full rounded-sm border border-line bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-navy disabled:bg-sand/50 disabled:text-muted aria-[invalid=true]:border-sahara sm:max-w-xs" />
                  <FieldError id="e-date" message={errors.date} />
                </div>
                <Toggle checked={draft.undecided} onChange={(v) => { set("undecided", v); if (v) set("flexible", false); }} label={t.dates.undecided} />
                {!draft.undecided && <Toggle checked={draft.flexible} onChange={(v) => set("flexible", v)} label={t.dates.flexible} />}
                {draft.flexible && !draft.undecided && (
                  <div role="radiogroup" aria-label={t.dates.flexible} className="flex flex-wrap gap-2">
                    {(["3", "7", "month"] as const).map((f) => (
                      <Chip key={f} active={draft.flex === f} onClick={() => set("flex", f)}>
                        {f === "3" ? t.dates.flex3 : f === "7" ? t.dates.flex7 : t.dates.flexMonth}
                      </Chip>
                    ))}
                  </div>
                )}
                <p className="rounded-sm bg-sand/70 px-4 py-3 text-sm leading-relaxed text-muted">{t.dates.hint}</p>
              </div>
            )}

            {current === "group" && (
              <div className="space-y-4">
                <Counter label={t.group.adults} hint={t.group.adultsHint} value={draft.adults} min={1} max={30} less={t.group.less} more={t.group.more} onChange={(v) => set("adults", v)} />
                <Counter label={t.group.children} hint={t.group.childrenHint} value={draft.children} min={0} max={30} less={t.group.less} more={t.group.more} onChange={(v) => set("children", v)} />
                <div className="rounded-sm border border-line bg-white p-5">
                  <p className="mono text-gold">{t.group.estimate}</p>
                  {estimate !== null && perPerson !== null ? (
                    <>
                      <p className="mt-1 font-display text-3xl font-semibold text-navy">{formatPrice(estimate, currency, lang)}</p>
                      <p className="mono mt-1 text-muted">{people} × {formatPrice(perPerson, currency, lang)} {t.group.perPerson}</p>
                      <p className="mt-3 text-sm text-muted">{t.group.note}</p>
                    </>
                  ) : (
                    <p className="mt-1 text-ink">{onRequest || draft.custom ? t.group.onRequest : "…"}</p>
                  )}
                </div>
              </div>
            )}

            {current === "prefs" && (
              <div className="space-y-6">
                <fieldset>
                  <legend className="text-sm font-medium text-navy">{t.prefs.accommodation}</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {(["standard", "superior", "luxury"] as const).map((a) => (
                      <label key={a} className={`flex cursor-pointer gap-3 rounded-sm border bg-white p-4 transition-colors sm:flex-col ${draft.accommodation === a ? "border-navy shadow-[0_0_0_1px_var(--navy)]" : "border-line hover:border-navy/40"}`}>
                        <input type="radio" name="accommodation" value={a} checked={draft.accommodation === a} onChange={() => set("accommodation", a)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--navy)] sm:mt-0" />
                        <span>
                          <span className="block font-semibold text-navy">{t.prefs[a]}</span>
                          <span className="mt-0.5 block text-sm text-muted">{t.prefs[`${a}Text`]}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label htmlFor="f-notes" className="text-sm font-medium text-navy">{t.prefs.notes}</label>
                  <textarea id="f-notes" rows={5} maxLength={1500} value={draft.notes} placeholder={t.prefs.notesHint} onChange={(e) => set("notes", e.target.value)}
                    className="mt-1.5 block w-full rounded-sm border border-line bg-white px-4 py-3 text-base text-ink outline-none placeholder:text-muted/70 focus:border-navy" />
                </div>
              </div>
            )}

            {current === "details" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="firstName" label={t.details.firstName} required value={draft.firstName} error={errors.firstName} autoComplete="given-name" onChange={(v) => set("firstName", v)} />
                <Field id="lastName" label={t.details.lastName} required value={draft.lastName} error={errors.lastName} autoComplete="family-name" onChange={(v) => set("lastName", v)} />
                <Field id="email" label={t.details.email} required type="email" inputMode="email" value={draft.email} error={errors.email} autoComplete="email" onChange={(v) => set("email", v)} />
                <Field id="phone" label={t.details.phone} required={draft.contactBy !== "email"} type="tel" inputMode="tel" value={draft.phone} error={errors.phone} autoComplete="tel" onChange={(v) => set("phone", v)} />
                <Field id="country" label={t.details.country} value={draft.country} error={errors.country} autoComplete="country-name" onChange={(v) => set("country", v)} />
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-medium text-navy">{t.details.contactBy}</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["email", "whatsapp", "phone"] as const).map((c) => (
                      <Chip key={c} active={draft.contactBy === c} onClick={() => set("contactBy", c)}>
                        {c === "email" ? t.details.byEmail : c === "whatsapp" ? t.details.byWhatsapp : t.details.byPhone}
                      </Chip>
                    ))}
                  </div>
                </fieldset>
                {/* honeypot: hidden from people, bots fill it and get a silent fake success */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>Website <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>
              </div>
            )}

            {current === "review" && (
              <div className="space-y-6">
                <dl className="divide-y divide-line rounded-sm border border-line bg-white">
                  <ReviewRow label={t.steps.trip} value={tripTitle} edit={t.edit} onEdit={() => goTo(0)} />
                  <ReviewRow label={t.steps.dates} value={dateText} edit={t.edit} onEdit={() => goTo(1)} />
                  <ReviewRow label={t.steps.group} value={`${travellers}${estimateText ? ` · ${estimateText}` : ""}`} edit={t.edit} onEdit={() => goTo(2)} />
                  <ReviewRow label={t.steps.prefs} value={`${t.prefs[draft.accommodation]}${draft.notes.trim() ? ` · ${draft.notes.trim()}` : ""}`} edit={t.edit} onEdit={() => goTo(3)} />
                  <ReviewRow label={t.steps.details} value={[`${draft.firstName} ${draft.lastName}`, draft.email, draft.phone, draft.country].filter((x) => x.trim()).join(" · ")} edit={t.edit} onEdit={() => goTo(4)} />
                </dl>
                <div>
                  <label className="flex items-start gap-3 text-sm leading-relaxed text-ink">
                    <input id="f-consent" type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors({}); }}
                      aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "e-consent" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--navy)]" />
                    <span>{t.review.consent}</span>
                  </label>
                  <FieldError id="e-consent" message={errors.consent} />
                </div>
                <ul className="grid gap-2 text-sm text-muted sm:grid-cols-3">
                  {[t.review.noPayment, t.review.reply, t.review.local].map((x) => (
                    <li key={x} className="flex items-center gap-2"><Check />{x}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* desktop actions (phones use the bottom bar) */}
          <div className="mt-10 hidden items-center justify-between gap-4 lg:flex">
            {step > 0 ? <button type="button" onClick={() => goTo(step - 1)} className="font-semibold text-navy underline-offset-4 hover:underline">← {t.back}</button> : <span />}
            <button type="button" onClick={next} disabled={pending} className="btn-gold min-w-48 disabled:opacity-60">
              {current === "review" ? (pending ? t.review.sending : t.review.submit) : t.next}
            </button>
          </div>
        </section>
      </div>

      {/* summary (large screens) */}
      <aside className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-28 rounded-sm border border-line bg-white p-6">
          <p className="eyebrow">{t.summary}</p>
          {trip && !draft.custom && trip.hero && (
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-sm bg-sand">
              <Image src={trip.hero.url} alt={trip.hero.alt} fill sizes="320px" className="object-cover" />
            </div>
          )}
          <p className="mt-4 font-semibold text-navy">{tripTitle}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {reached >= 1 && <SummaryLine label={t.steps.dates} value={dateText} />}
            {reached >= 2 && <SummaryLine label={t.steps.group} value={travellers} />}
            {reached >= 3 && <SummaryLine label={t.prefs.accommodation} value={t.prefs[draft.accommodation]} />}
          </dl>
          {estimateText && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="mono text-gold">{t.group.estimate}</p>
              <p className="font-display text-2xl font-semibold text-navy">{estimateText}</p>
            </div>
          )}
          <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm text-muted">
            {[t.review.noPayment, t.review.reply, t.review.local].map((x) => (
              <li key={x} className="flex items-center gap-2"><Check />{x}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/* phones and tablets: fixed bottom bar */}
      <div data-mobile-bar className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => goTo(step - 1)} aria-label={t.back} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-line text-navy">
              <span aria-hidden="true" className="text-xl">←</span>
            </button>
          )}
          <div className="min-w-0 flex-1">
            {estimateText ? (
              <>
                <p className="mono truncate text-[0.7rem] text-muted">{t.group.estimate}</p>
                <p className="truncate font-semibold text-navy">{estimateText}</p>
              </>
            ) : (
              <p className="truncate text-sm font-medium text-navy">{tripTitle !== "—" ? tripTitle : t.steps[current]}</p>
            )}
          </div>
          <button type="button" onClick={next} disabled={pending} className="btn-gold shrink-0 !px-6 !py-3 disabled:opacity-60">
            {current === "review" ? (pending ? t.review.sending : t.review.submit) : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}

function TripStep({ tours, draft, t, tabs, toursDict, lang, error, onPick, onCustom }: {
  tours: TourCard[]; draft: Draft; t: Dictionary["book"]; tabs: Dictionary["tours"]["tabs"]; toursDict: Dictionary["tours"]; lang: Locale; error?: string;
  onPick: (id: number) => void; onCustom: () => void;
}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<string>("all");
  const groups = HUBS.filter((h) => h.tab !== "all" && tours.some((x) => x.category.key === h.key));
  const q = query.trim().toLowerCase();
  const list = tours.filter((x) => (tab === "all" || x.category.key === tab) && (!q || x.title.toLowerCase().includes(q)));

  return (
    <div>
      <button type="button" id="f-tripId" onClick={onCustom} aria-pressed={draft.custom}
        className={`flex w-full items-start gap-4 rounded-sm border p-4 text-left transition-colors ${draft.custom ? "border-navy bg-white shadow-[0_0_0_1px_var(--navy)]" : "border-dashed border-gold/60 bg-sand/40 hover:border-navy/40"}`}>
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-navy text-xl text-gold-light">✦</span>
        <span>
          <span className="block font-semibold text-navy">{t.trip.custom}</span>
          <span className="mt-0.5 block text-sm text-muted">{t.trip.customText}</span>
        </span>
      </button>
      <FieldError id="e-tripId" message={error} />

      <div className="mt-6">
        <label htmlFor="trip-search" className="sr-only">{t.trip.search}</label>
        <input id="trip-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.trip.search}
          className="block w-full rounded-sm border border-line bg-white px-4 py-3.5 text-base text-ink outline-none placeholder:text-muted/70 focus:border-navy" />
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <Chip active={tab === "all"} onClick={() => setTab("all")}>{tabs.all}</Chip>
        {groups.map((g) => (
          <Chip key={g.key} active={tab === g.key} onClick={() => setTab(g.key)}>{tabs[g.tab as keyof typeof tabs]}</Chip>
        ))}
      </div>

      <ul className="mt-4 space-y-2.5">
        {list.map((x) => {
          const active = draft.tripId === x.id && !draft.custom;
          const meta = [formatDuration(x, toursDict), x.from_price !== null ? `${toursDict.from} ${formatPrice(x.from_price, x.currency, lang)}` : null].filter(Boolean).join(" · ");
          return (
            <li key={x.id}>
              <button type="button" onClick={() => onPick(x.id)} aria-pressed={active}
                className={`flex w-full items-center gap-3.5 rounded-sm border bg-white p-2.5 text-left transition-colors ${active ? "border-navy shadow-[0_0_0_1px_var(--navy)]" : "border-line hover:border-navy/40"}`}>
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-sand">
                  {x.hero && <Image src={x.hero.url} alt="" fill sizes="64px" className="object-cover" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 font-semibold leading-snug text-navy">{x.title}</span>
                  {meta && <span className="mono mt-1 block text-muted">{meta}</span>}
                </span>
                <span aria-hidden="true" className={`mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${active ? "border-navy bg-navy text-white" : "border-line text-transparent"}`}>✓</span>
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="py-6 text-center text-muted">{t.trip.none}</li>}
      </ul>
    </div>
  );
}

function Success({ t, lang, done, whatsappMessage }: { t: Dictionary["book"]; lang: Locale; done: { reference: string; name: string }; whatsappMessage: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20" role="status">
      <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-atlas text-2xl text-white">✓</span>
      <h2 className="heading mt-6 text-[clamp(1.8rem,3.4vw,2.6rem)]">{t.success.title.replace("{name}", done.name)}</h2>
      <p className="mt-3 text-lg text-ink">
        {t.success.text.split("{reference}")[0]}
        <span className="mono font-semibold text-navy">{done.reference}</span>
        {t.success.text.split("{reference}")[1]}
      </p>
      <h3 className="mt-10 font-semibold text-navy">{t.success.next}</h3>
      <ol className="mt-4 space-y-4">
        {[t.success.step1, t.success.step2, t.success.step3].map((s, i) => (
          <li key={s} className="flex gap-4">
            <span className="font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm text-white">{i + 1}</span>
            <span className="pt-1 text-ink">{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink(whatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn-gold">{t.success.whatsapp}</a>
        <Link href={localePath(lang, "/")} className="inline-flex items-center justify-center rounded-sm border border-line px-6 py-3 font-semibold text-navy">{t.success.home}</Link>
      </div>
    </div>
  );
}

function Counter({ label, hint, value, min, max, less, more, onChange }: { label: string; hint: string; value: number; min: number; max: number; less: string; more: string; onChange: (v: number) => void }) {
  const btn = "flex h-12 w-12 items-center justify-center rounded-full border border-line text-2xl leading-none text-navy transition-colors hover:border-navy disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4 rounded-sm border border-line bg-white p-4">
      <div>
        <p className="font-semibold text-navy">{label}</p>
        <p className="text-sm text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-3" role="group" aria-label={label}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${less}: ${label}`} className={btn}>−</button>
        <output aria-live="polite" className="font-display w-8 text-center text-xl font-semibold text-navy">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${more}: ${label}`} className={btn}>+</button>
      </div>
    </div>
  );
}

function Field({ id, label, value, onChange, error, required, type = "text", inputMode, autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean;
  type?: string; inputMode?: "email" | "tel" | "text"; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={`f-${id}`} className="text-sm font-medium text-navy">{label}{required && " *"}</label>
      <input id={`f-${id}`} type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)} aria-describedby={error ? `e-${id}` : undefined} aria-required={required}
        className="mt-1.5 block w-full rounded-sm border border-line bg-white px-4 py-3.5 text-base text-ink outline-none focus:border-navy aria-[invalid=true]:border-sahara" />
      <FieldError id={`e-${id}`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-1.5 text-sm text-sahara">{message}</p> : null;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 shrink-0 accent-[var(--navy)]" />
      <span>{label}</span>
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/50"}`}>
      {children}
    </button>
  );
}

function ReviewRow({ label, value, edit, onEdit }: { label: string; value: string; edit: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4">
      <div className="min-w-0">
        <dt className="mono text-gold">{label}</dt>
        <dd className="mt-1 break-words text-ink">{value}</dd>
      </div>
      <button type="button" onClick={onEdit} className="shrink-0 text-sm font-semibold text-navy underline underline-offset-4">{edit}</button>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}

function Check() {
  return <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-atlas text-[0.6rem] text-white">✓</span>;
}
