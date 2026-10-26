"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Elevation profile, Marrakech to the summit. x in viewBox units (0-1000), altitude in metres. */
const STOPS = [
  { key: "marrakech", x: 0, alt: 466 },
  { key: "imlil", x: 300, alt: 1740 },
  { key: "refuge", x: 680, alt: 3207 },
  { key: "summit", x: 1000, alt: 4167 },
] as const;
const PROFILE_H = 120;
const y = (alt: number) => 110 - (alt / 4167) * 95;
const ROAD = `M0 ${y(466)} C120 ${y(466)} 200 ${y(1740) + 2} 300 ${y(1740)}`;
const TRAIL =
  `M300 ${y(1740)} L360 64 L410 66 L470 55 L540 50 L600 42 L640 44 L680 ${y(3207)} ` +
  `L740 33 L790 35 L860 24 L920 20 L960 17 L1000 ${y(4167)}`;

/**
 * "Topo" hero: real trail footage framed like a map inset, contour lines behind, and the route
 * from Marrakech to the summit drawn as an elevation profile. On phones the footage fills the hero.
 */
export function TopoHero({ lang, dict, camps }: { lang: Locale; dict: Dictionary["hero"]; camps: Dictionary["ruler"]["camps"] }) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [paused, setPaused] = useState(false);
  const playing = !paused && !reducedMotion;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) el.play().catch(() => undefined);
    else el.pause();
  }, [playing]);

  return (
    <section className="relative isolate overflow-hidden bg-navy-deep text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[url(/textures/topo.svg)] bg-cover bg-center opacity-20 lg:opacity-30"
      />

      <div className="mx-auto grid min-h-[min(calc(100svh-4.25rem),52rem)] md:min-h-[min(calc(100svh-5rem),52rem)] max-w-7xl content-end gap-8 px-4 pb-6 pt-16 md:px-8 lg:grid-cols-12 lg:content-center lg:items-center lg:gap-x-12 lg:gap-y-6 lg:pb-6 lg:pt-10">
        <div className="lg:col-span-7">
          <p className="mono fade-up flex flex-wrap items-center gap-x-3 gap-y-1 text-gold-light">
            <span>31.06°N · 7.91°W</span>
            <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
            <span>Jbel Toubkal ▲ 4167 m</span>
          </p>
          <h1 className="font-display mt-5 max-w-[16ch] text-[clamp(2.1rem,4.4vw,3.7rem)] font-semibold leading-[1.08] text-white">
            {dict.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{dict.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={localePath(lang, "/treks")} className="btn-gold">
              {dict.primary}
              <Arrow />
            </Link>
            <Link href={localePath(lang, "/contact")} className="btn-outline-light">
              {dict.secondary}
            </Link>
          </div>
        </div>

        {/* Phones: full-bleed background. Desktop: map-inset frame with corner ticks. */}
        <div className="absolute inset-0 -z-20 lg:relative lg:inset-auto lg:z-auto lg:col-span-5 lg:aspect-[4/5] lg:h-[min(34rem,calc(100svh-19rem))] lg:w-auto lg:justify-self-end">
          <video
            ref={video}
            className="h-full w-full object-cover lg:rounded-sm"
            src="/video/hero-toubkal.mp4"
            poster="/video/hero-toubkal-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={dict.video}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/15 lg:hidden" />
          <span aria-hidden="true" className="absolute -left-3 -top-3 hidden h-6 w-6 border-l border-t border-gold-light/70 lg:block" />
          <span aria-hidden="true" className="absolute -right-3 -top-3 hidden h-6 w-6 border-r border-t border-gold-light/70 lg:block" />
          <span aria-hidden="true" className="absolute -bottom-3 -left-3 hidden h-6 w-6 border-b border-l border-gold-light/70 lg:block" />
          <span aria-hidden="true" className="absolute -bottom-3 -right-3 hidden h-6 w-6 border-b border-r border-gold-light/70 lg:block" />
        </div>

        <div className="lg:col-span-12">
          <div className="mono flex flex-row-reverse items-center justify-end gap-3 text-white/60">
            <span>{dict.caption}</span>
            <button
              type="button"
              onClick={() => setPaused(playing)}
              aria-label={playing ? dict.pause : dict.play}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-navy"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
              </svg>
            </button>
          </div>

          {/* top margin leaves room for the labels, which sit above their point */}
          <figure className="relative mt-12" aria-label={dict.profile}>
            <svg viewBox={`0 0 1000 ${PROFILE_H}`} preserveAspectRatio="none" className="block h-16 w-full md:h-20" aria-hidden="true">
              <defs>
                <linearGradient id="trail-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#d9a04f" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#d9a04f" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" x2="1000" y1="110" y2="110" stroke="white" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
              <path d={`${TRAIL} L1000 110 L300 110 Z`} fill="url(#trail-fill)" className="fade-up [animation-delay:1.6s]" />
              <path d={ROAD} fill="none" stroke="white" strokeOpacity="0.55" strokeDasharray="2 5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" className="fade-up [animation-delay:0.3s]" />
              {/* no vector-effect here: it would make the pathLength-based drawing animation use screen pixels */}
              <path d={TRAIL} pathLength={1} fill="none" stroke="#d9a04f" strokeWidth="2.5" strokeLinejoin="round" className="draw-route" />
            </svg>
            {STOPS.map((stop, i) => (
              <div
                key={stop.key}
                className={`fade-up absolute flex -translate-y-full flex-col pb-2 ${
                  i === 0 ? "items-start" : i === STOPS.length - 1 ? "-translate-x-full items-end" : "-translate-x-1/2 items-center"
                }`}
                style={{ left: `${stop.x / 10}%`, top: `${(y(stop.alt) / PROFILE_H) * 100}%`, animationDelay: `${0.5 + i * 0.6}s` }}
              >
                {/* phones: the refuge label would collide with the summit, so it keeps only its point */}
                <span className={`${stop.key === "refuge" ? "hidden md:contents" : "contents"}`}>
                  <span className="mono whitespace-nowrap text-[0.62rem] text-white md:text-[0.7rem]">{camps[stop.key]}</span>
                  <span className="mono text-[0.6rem] text-gold-light md:text-[0.68rem]">{stop.alt} m</span>
                </span>
                <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full border-2 border-navy-deep bg-gold-light" />
              </div>
            ))}
          </figure>
        </div>
      </div>
    </section>
  );
}
