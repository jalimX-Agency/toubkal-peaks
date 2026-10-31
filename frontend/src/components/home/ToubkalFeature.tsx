import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { formatPrice } from "@/lib/format";
import { photos } from "@/lib/site";

/** The classic two-day route from Imlil: position along the trail (0-1) and altitude. */
const STOPS = [
  { key: "imlil", at: 0, alt: 1740 },
  { key: "chamharouch", at: 0.32, alt: 2350 },
  { key: "refuge", at: 0.7, alt: 3207 },
  { key: "summit", at: 1, alt: 4167 },
] as const;

const W = 600;
const H = 260;
// the altitude scale sits in the left margin, clear of the stop labels and the summit marker
const PAD = { left: 56, right: 16, top: 40, bottom: 36 };
const x = (at: number) => PAD.left + at * (W - PAD.left - PAD.right);
const y = (alt: number) => PAD.top + (1 - (alt - 1500) / (4300 - 1500)) * (H - PAD.top - PAD.bottom);

/** Mount Toubkal, the company's signature climb: the route as an elevation profile, key figures and the trips. */
export function ToubkalFeature({ lang, dict, count, fromPrice, guideLabel }: {
  lang: Locale;
  guideLabel: string;
  dict: Dictionary["toubkal"];
  count: number;
  fromPrice: { amount: number; currency: string } | null;
}) {
  const points = STOPS.map((s) => `${x(s.at)},${y(s.alt)}`);
  const line = `M${points.join(" L")}`;
  const area = `${line} L${x(1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;

  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
          <p className="mt-5 leading-relaxed text-muted">{dict.text}</p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-5">
            <div>
              <dt className="sr-only">{dict.stats.summit}</dt>
              <dd className="font-display text-2xl font-semibold text-navy md:text-3xl">4 167 m</dd>
              <p className="mt-1 text-xs text-muted">{dict.stats.summit}</p>
            </div>
            <div>
              <dt className="sr-only">{dict.stats.gain}</dt>
              <dd className="font-display text-2xl font-semibold text-navy md:text-3xl">+2 427 m</dd>
              <p className="mt-1 text-xs text-muted">{dict.stats.gain}</p>
            </div>
            <div>
              <dt className="sr-only">{dict.stats.days}</dt>
              <dd className="font-display text-2xl font-semibold text-navy md:text-3xl">2</dd>
              <p className="mt-1 text-xs text-muted">{dict.stats.days}</p>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={localePath(lang, "/treks/toubkal")} className="btn-gold">
              {dict.cta}
              <Arrow />
            </Link>
            <Link href={localePath(lang, "/toubkal-guide")} className="text-sm font-semibold text-navy underline decoration-gold underline-offset-4 hover:text-gold">
              {guideLabel}
            </Link>
            {count > 0 && (
              <p className="text-sm text-muted">
                {dict.trips.replace("{count}", String(count))}
                {fromPrice && <> · <span className="font-semibold text-navy">{dict.from.replace("{price}", formatPrice(fromPrice.amount, fromPrice.currency, lang))}</span></>}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
            <Image src={photos.hikers.src} alt="" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-deep/70 to-transparent" />
            <p className="mono absolute bottom-4 left-4 text-gold-light">Imlil → ▲ 4167 m</p>
          </div>
          <figure className="mt-6 rounded-sm border border-line bg-white p-4 md:p-6">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={dict.profileLabel}>
              {[2000, 3000, 4000].map((alt) => (
                <g key={alt}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y(alt)} y2={y(alt)} stroke="var(--line)" strokeDasharray="3 5" />
                  <text x={PAD.left - 8} y={y(alt) + 3} textAnchor="end" className="fill-muted text-[10px]">{alt} m</text>
                </g>
              ))}
              <path d={area} fill="var(--gold)" opacity="0.12" />
              <path d={line} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinejoin="round" />
              {STOPS.map((s, i) => (
                <g key={s.key}>
                  <circle cx={x(s.at)} cy={y(s.alt)} r={s.key === "summit" ? 6 : 4.5} fill={s.key === "summit" ? "var(--navy)" : "white"} stroke="var(--navy)" strokeWidth="2" />
                  <text x={x(s.at)} y={y(s.alt) - 12} textAnchor={i === 0 ? "start" : i === STOPS.length - 1 ? "end" : "middle"} className="fill-navy text-[11px] font-semibold">
                    {dict.stops[s.key]}
                  </text>
                  <text x={x(s.at)} y={H - PAD.bottom + 18} textAnchor={i === 0 ? "start" : i === STOPS.length - 1 ? "end" : "middle"} className="fill-muted text-[10px]">
                    {s.alt} m
                  </text>
                </g>
              ))}
            </svg>
          </figure>
        </div>
      </div>
    </section>
  );
}
