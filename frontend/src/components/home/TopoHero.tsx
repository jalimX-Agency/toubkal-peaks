"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, photos, stock } from "@/lib/site";

function mediaQuery(query: string) {
  return {
    subscribe(onChange: () => void) {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    get: () => window.matchMedia(query).matches,
  };
}
const reducedMotionQuery = mediaQuery("(prefers-reduced-motion: reduce)");
const desktopQuery = mediaQuery("(min-width: 1024px)");

/** Desktop slides, mountains first: each photo is labelled with its place and, when known, its altitude. */
const SLIDES: { key: keyof Dictionary["hero"]["slides"]; photo: { src: string }; alt: number | null; position: string }[] = [
  { key: "atlas", photo: photos.village, alt: 1900, position: "50% 55%" },
  { key: "oukaimeden", photo: stock.oukaimeden, alt: 2600, position: "50% 45%" },
  { key: "sahara", photo: stock.saharaDunes, alt: 700, position: "50% 60%" },
  { key: "highAtlas", photo: stock.atlasSnow, alt: null, position: "50% 50%" },
  { key: "kasbah", photo: stock.aitBenhaddou, alt: 1300, position: "50% 50%" },
  { key: "valleys", photo: stock.atlasValley, alt: null, position: "50% 50%" },
  { key: "cities", photo: stock.fesTanneries, alt: 410, position: "50% 50%" },
];
const INTERVAL = 6500;

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

function PlayPause({ playing, dict, onToggle }: { playing: boolean; dict: Dictionary["hero"]; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? dict.pause : dict.play}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition-colors hover:bg-white hover:text-navy"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
      </svg>
    </button>
  );
}

/**
 * "Topo" hero. Phones: real Toubkal trail footage fills the hero. Desktop: full-bleed photos that
 * change on their own, each labelled with its coordinates and altitude like a map. Both share the
 * contour lines and the elevation profile from Marrakech to the summit.
 */
export function TopoHero({ lang, dict, camps }: { lang: Locale; dict: Dictionary["hero"]; camps: Dictionary["ruler"]["camps"] }) {
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(reducedMotionQuery.subscribe, reducedMotionQuery.get, () => false);
  const desktop = useSyncExternalStore(desktopQuery.subscribe, desktopQuery.get, () => false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  const playing = !paused && !reducedMotion;
  const slide = SLIDES[index];

  // The video only plays (and downloads, preload="none") on phones.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing && !desktop) el.play().catch(() => undefined);
    else el.pause();
  }, [playing, desktop]);

  const go = useCallback((next: number) => setIndex((next + SLIDES.length) % SLIDES.length), []);
  // move on only once the next photo is ready, so a slow connection never shows an empty slide
  const nextReady = loaded.has((index + 1) % SLIDES.length);
  useEffect(() => {
    if (!playing || !desktop || !nextReady) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [playing, desktop, nextReady, index, go]);

  return (
    <section className="relative isolate overflow-hidden bg-navy-deep text-white">
      {/* phones: footage */}
      <div className="absolute inset-0 -z-20 lg:hidden">
        <video
          ref={video}
          className="h-full w-full object-cover"
          src={media.heroVideo}
          poster={media.heroPoster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={dict.video}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-navy-deep/15" />
      </div>

      {/* desktop: photos (tiny image candidates on phones, where they stay hidden) */}
      <div className="absolute inset-0 -z-20 hidden lg:block">
        {SLIDES.map((s, i) => (
          <div key={s.key} aria-hidden={i !== index} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}>
            <Image
              src={s.photo.src}
              alt={dict.slides[s.key].alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 100vw, 10vw"
              onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
              className={`object-cover transition-transform duration-[7000ms] ease-out ${i === index && playing ? "scale-105" : "scale-100"}`}
              style={{ objectPosition: s.position }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/90 via-navy-deep/55 to-navy-deep/10" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-navy-deep/95 to-transparent" />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-20 lg:opacity-[0.18]"
        style={{ backgroundImage: `url(${media.topo})` }}
      />

      {/* the header floats over the hero (transparent until scrolled): the hero takes the full screen and starts below the bar */}
      <div className="mx-auto grid min-h-[min(100svh,56.25rem)] max-w-7xl content-end gap-8 px-4 pb-6 pt-[6.25rem] md:min-h-[min(100svh,57rem)] md:px-8 md:pt-28 lg:gap-y-6 lg:pb-6 lg:pt-28">
        <div className="max-w-2xl lg:self-center">
          {/* phones: where the footage was filmed; desktop: the place in the current photo */}
          <p className="mono fade-up flex flex-wrap items-center gap-x-3 gap-y-1 text-gold-light">
            <span aria-hidden="true" className="h-px w-8 bg-gold-light/60" />
            <span className="lg:hidden">Jbel Toubkal ▲ 4167 m</span>
            <span className="hidden lg:inline">
              {dict.slides[slide.key].place}
              {slide.alt && ` ▲ ${slide.alt} m`}
            </span>
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
            <Link href={localePath(lang, "/book")} className="btn-outline-light">
              {dict.secondary}
            </Link>
          </div>
        </div>

        <div className="lg:mt-6">
          <div className="mono flex items-center gap-3 text-white/60">
            <PlayPause playing={playing} dict={dict} onToggle={() => setPaused(playing)} />
            <span className="lg:hidden">{dict.caption}</span>
            <ol className="hidden flex-1 grid-cols-7 gap-3 lg:grid">
              {SLIDES.map((s, i) => (
                <li key={s.key}>
                  <button type="button" onClick={() => go(i)} aria-current={i === index ? "true" : undefined} className="group w-full text-left">
                    <span className="relative block h-px overflow-hidden bg-white/25">
                      {i === index && (
                        <span
                          key={`${index}-${playing}`}
                          className="absolute inset-0 origin-left bg-gold-light"
                          style={playing ? { animation: `slide-progress ${INTERVAL}ms linear forwards` } : undefined}
                        />
                      )}
                    </span>
                    <span className={`mt-2 block truncate transition-colors ${i === index ? "text-white" : "text-white/50 group-hover:text-white/80"}`}>
                      {dict.slides[s.key].place}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
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
