import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatDifficulty, formatDuration, formatPrice } from "@/lib/format";
import { media, whatsappLink } from "@/lib/site";
import type { ItineraryDay, PriceTier, TourDetail } from "@/lib/types";

type TripDict = Dictionary["trip"];

/** "snake_case" API keys we have no translation for are shown humanised. */
const humanise = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const entries = (value: Record<string, string> | []) => (Array.isArray(value) ? [] : Object.entries(value).filter(([, v]) => v));

/** The reservation wizard with this trip already chosen. */
export const bookHref = (tour: TourDetail, lang: Locale) => `${localePath(lang, "/book")}?trip=${tour.slug}`;

/** "Label: text" items from the old site become a bold label and the text. */
function LabelledItem({ text }: { text: string }) {
  const i = text.indexOf(":");
  if (i <= 0 || i > 40) return <>{text}</>;
  return (
    <>
      <strong className="font-semibold text-navy">{text.slice(0, i)}</strong>
      {text.slice(i)}
    </>
  );
}

export function TripHero({ tour, lang, trip, tours, homeLabel, categoryLabel }: { tour: TourDetail; lang: Locale; trip: TripDict; tours: Dictionary["tours"]; homeLabel: string; categoryLabel: string }) {
  const duration = formatDuration(tour, tours);
  const difficulty = formatDifficulty(tour.difficulty, tours);

  return (
    <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.16]" style={{ backgroundImage: `url(${media.topo})` }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-16 lg:pt-10">
        <div className="lg:col-span-7">
          <nav aria-label="Breadcrumb" className="mono text-white/55">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href={localePath(lang, "/")} className="hover:text-white">{homeLabel}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={localePath(lang, tour.category.path)} className="hover:text-white">{categoryLabel}</Link>
              </li>
            </ol>
          </nav>
          <p className="mono mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-gold-light">
            {duration && <span>{duration}</span>}
            {difficulty && <span>· {difficulty}</span>}
            {tour.max_altitude_m && <span>· ▲ {tour.max_altitude_m} m</span>}
          </p>
          <h1 lang={tour.locale} className="font-display mt-4 text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.1]">
            {tour.title}
          </h1>
          {tour.summary && (
            <p lang={tour.locale} className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">
              {tour.summary}
            </p>
          )}
          {tour.locale !== lang && <p className="mono mt-4 normal-case tracking-normal text-white/50">{trip.englishOnly}</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={bookHref(tour, lang)} className="btn-gold">
              {trip.request}
              <Arrow />
            </Link>
            <a href={whatsappLink(`${tour.title}: ${trip.whatsapp}`)} target="_blank" rel="noopener noreferrer" className="btn-outline-light">
              {trip.whatsapp}
            </a>
          </div>
        </div>

        {tour.images.hero && (
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-navy">
              <Image src={tour.images.hero.url} alt={tour.images.hero.alt || tour.title} fill priority sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
            <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 border-l border-t border-gold-light/70" />
            <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-gold-light/70" />
          </div>
        )}
      </div>
    </section>
  );
}

function tierLabel(t: PriceTier, trip: TripDict) {
  if (t.max_pax === null) return trip.personsPlus.replace("{min}", String(t.min_pax));
  if (t.min_pax === 1 && t.max_pax === 1) return trip.person;
  return trip.persons.replace("{min}", String(t.min_pax)).replace("{max}", String(t.max_pax));
}

export function PriceCard({ tour, lang, trip }: { tour: TourDetail; lang: Locale; trip: TripDict }) {
  const { pricing } = tour;
  const tiers = pricing.tiers.filter((t) => t.price_per_person !== null);

  return (
    <div className="rounded-sm border border-line bg-white p-6 shadow-[0_12px_32px_rgba(2,46,85,0.08)]">
      {pricing.mode === "tiers" && pricing.from_price ? (
        <p className="text-sm text-muted">
          {trip.priceFrom}{" "}
          <span className="font-display text-3xl font-semibold text-navy">{formatPrice(pricing.from_price, pricing.currency, lang)}</span>{" "}
          {trip.perPerson}
        </p>
      ) : (
        <p className="font-display text-2xl font-semibold text-navy">{trip.onRequest}</p>
      )}

      {tiers.length > 1 && (
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="mono text-left text-muted">
              <th className="pb-2 font-medium">{trip.groupSize}</th>
              <th className="pb-2 text-right font-medium">{trip.pricePerPerson}</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((t) => (
              <tr key={t.min_pax} className="border-t border-line">
                <td className="py-2.5 text-ink">{tierLabel(t, trip)}</td>
                <td className="py-2.5 text-right font-semibold text-navy">{formatPrice(t.price_per_person!, pricing.currency, lang)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted">{trip.priceNote}</p>
      <Link href={bookHref(tour, lang)} className="btn-gold mt-5 w-full">
        {trip.request}
      </Link>
      <a href={whatsappLink(`${tour.title}: ${trip.whatsapp}`)} target="_blank" rel="noopener noreferrer" className="btn-outline-navy mt-3 w-full">
        {trip.whatsapp}
      </a>
    </div>
  );
}

/** Phones: price and the booking button stay at the bottom of the screen. */
export function MobileBookBar({ tour, lang, trip }: { tour: TourDetail; lang: Locale; trip: TripDict }) {
  const { pricing } = tour;
  return (
    <div data-mobile-bar className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <p className="text-xs text-muted">
        {pricing.mode === "tiers" && pricing.from_price ? (
          <>
            {trip.priceFrom} <span className="text-lg font-semibold text-navy">{formatPrice(pricing.from_price, pricing.currency, lang)}</span>
            <span className="block">{trip.perPerson}</span>
          </>
        ) : (
          <span className="text-sm font-semibold text-navy">{trip.onRequest}</span>
        )}
      </p>
      <Link href={bookHref(tour, lang)} className="btn-gold !px-5 !py-3">
        {trip.request}
      </Link>
    </div>
  );
}

export function Facts({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  const facts = entries(tour.facts);
  if (facts.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 sm:grid-cols-3">
      {facts.map(([key, value]) => (
        <div key={key}>
          <dt className="mono text-gold">{trip.facts[key as keyof TripDict["facts"]] ?? humanise(key)}</dt>
          <dd lang={tour.locale} className="mt-1 text-sm font-medium text-navy">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Highlights({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.highlights.length === 0) return null;
  return (
    <section>
      <h2 className="heading text-2xl">{trip.highlights}</h2>
      <ul lang={tour.locale} className="mt-5 grid gap-3 sm:grid-cols-2">
        {tour.highlights.map((h, k) => (
          <li key={`${k}-${h}`} className="flex gap-3 text-ink">
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
            {h}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Known stops of the Toubkal route; other treks show the climb from Marrakech to their highest point. */
const TOUBKAL_STOPS = [
  { key: "marrakech", alt: 466 },
  { key: "imlil", alt: 1740 },
  { key: "refuge", alt: 3207 },
  { key: "summit", alt: 4167 },
] as const;

export function AltitudeProfile({ tour, trip, camps }: { tour: TourDetail; trip: TripDict; camps: Dictionary["ruler"]["camps"] }) {
  if (!tour.max_altitude_m || !tour.category.key.startsWith("treks")) return null;
  const toubkal = tour.max_altitude_m >= 4100;
  const stops = toubkal
    ? TOUBKAL_STOPS.map((s) => ({ label: camps[s.key], alt: s.alt }))
    : [
        { label: camps.marrakech, alt: 466 },
        { label: trip.facts.maximum_altitude, alt: tour.max_altitude_m },
      ];
  const top = Math.max(4167, tour.max_altitude_m);
  const y = (alt: number) => 110 - (alt / top) * 95;
  const x = (i: number) => (i / (stops.length - 1)) * 1000;
  const path = stops.map((s, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(s.alt)}`).join(" ");

  return (
    <section>
      <h2 className="heading text-2xl">{trip.profile}</h2>
      <figure className="relative mt-14">
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="block h-24 w-full" aria-hidden="true">
          <line x1="0" x2="1000" y1="110" y2="110" stroke="var(--line)" vectorEffect="non-scaling-stroke" />
          <path d={`${path} L1000 110 L0 110 Z`} fill="var(--gold)" fillOpacity="0.12" />
          <path d={path} pathLength={1} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" className="draw-route" />
        </svg>
        {stops.map((s, i) => (
          <div
            key={`${i}-${s.label}`}
            className={`absolute flex -translate-y-full flex-col pb-2 ${i === 0 ? "items-start" : i === stops.length - 1 ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"}`}
            style={{ left: `${x(i) / 10}%`, top: `${(y(s.alt) / 120) * 100}%` }}
          >
            <span className="mono whitespace-nowrap text-[0.66rem] text-navy">{s.label}</span>
            <span className="mono text-[0.64rem] text-gold">{s.alt} m</span>
            <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full border-2 border-white bg-gold" />
          </div>
        ))}
      </figure>
    </section>
  );
}

function DayStats({ day, trip }: { day: ItineraryDay; trip: TripDict }) {
  const stats = entries(day.stats);
  if (stats.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {stats.map(([key, value]) => (
        <li key={key} className="mono rounded-sm bg-sand/70 px-2.5 py-1 text-muted">
          {trip.stats[key as keyof TripDict["stats"]] ?? humanise(key)} <span className="text-navy">{value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Day-by-day programme as waypoints on a trail. The first day is open, the others unfold on demand. */
export function Itinerary({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.itinerary.length === 0) return null;
  return (
    <section>
      <h2 className="heading text-2xl">{trip.itinerary}</h2>
      <ol lang={tour.locale} className="relative mt-6">
        <span aria-hidden="true" className="absolute bottom-6 left-[1.15rem] top-6 border-l-2 border-dashed border-gold/40" />
        {tour.itinerary.map((day, i) => (
          <li key={`${day.day}-${i}`} className="relative pb-6 pl-14 last:pb-0">
            <span className="font-display absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-navy text-sm font-semibold text-white shadow-[0_0_0_1px_var(--line)]">
              {String(day.day).padStart(2, "0")}
            </span>
            <details open={i === 0} className="group rounded-sm border border-line bg-white open:shadow-[0_8px_24px_rgba(2,46,85,0.06)]">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="mono block text-gold">
                    {trip.day} {day.day}
                  </span>
                  <span className="mt-1 block font-semibold text-navy">{day.title}</span>
                </span>
                <span aria-hidden="true" className="mt-1 text-xl leading-none text-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="border-t border-line px-4 pb-5 pt-4">
                <DayStats day={day} trip={trip} />
                <div className="mt-3 space-y-3 leading-relaxed text-ink">
                  {day.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                {day.accommodation && (
                  <p className="mono mt-4 text-muted">
                    {trip.accommodation} · <span className="normal-case tracking-normal text-navy">{day.accommodation}</span>
                  </p>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function IncludedExcluded({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.included.length === 0 && tour.excluded.length === 0) return null;
  const column = (title: string, items: string[], ok: boolean) =>
    items.length > 0 && (
      <div className="rounded-sm border border-line bg-white p-6">
        <h3 className="heading text-xl">{title}</h3>
        <ul lang={tour.locale} className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
          {items.map((item, k) => (
            <li key={`${k}-${item}`} className="flex gap-3">
              <span aria-hidden="true" className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-white ${ok ? "bg-atlas" : "bg-sahara"}`}>
                {ok ? "✓" : "✕"}
              </span>
              <span>
                <LabelledItem text={item} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <section className="grid gap-5 md:grid-cols-2">
      {column(trip.included, tour.included, true)}
      {column(trip.excluded, tour.excluded, false)}
    </section>
  );
}

export function Packing({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.packing.length === 0) return null;
  return (
    <section>
      <h2 className="heading text-2xl">{trip.packing}</h2>
      <div lang={tour.locale} className="mt-5 divide-y divide-line border-y border-line">
        {tour.packing.map((group) => (
          <details key={group.group} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold text-navy [&::-webkit-details-marker]:hidden">
              {group.group}
              <span aria-hidden="true" className="text-xl leading-none text-gold transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="space-y-2 pb-5 text-sm leading-relaxed text-ink">
              {group.items.map((item, k) => (
                <li key={`${k}-${item}`} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Upgrades({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.upgrades.length === 0) return null;
  return (
    <section>
      <h2 className="heading text-2xl">{trip.upgrades}</h2>
      <ul lang={tour.locale} className="mt-5 space-y-3 text-ink">
        {tour.upgrades.map((u, k) => (
          <li key={`${k}-${u}`} className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
            <span>
              <LabelledItem text={u} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Gallery({ tour, trip }: { tour: TourDetail; trip: TripDict }) {
  if (tour.images.gallery.length === 0) return null;
  return (
    <section>
      <h2 className="heading text-2xl">{trip.gallery}</h2>
      <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        {tour.images.gallery.map((img, i) => (
          <li key={`${i}-${img.url}`} className={`relative overflow-hidden rounded-sm bg-sand ${i === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-[4/3]"}`}>
            <Image src={img.url} alt={img.alt || tour.title} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
          </li>
        ))}
      </ul>
    </section>
  );
}
