"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { photos } from "@/lib/site";

const SLIDES = [
  { key: "atlas", photo: photos.village, path: "/treks", position: "50% 55%" },
  { key: "sahara", photo: photos.dunes, path: "/sahara-desert-tours", position: "50% 60%" },
  { key: "cities", photo: photos.souk, path: "/morocco-tours", position: "50% 50%" },
] as const;

const INTERVAL = 7000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Photo-first hero: three full-bleed slides (Atlas, Sahara, imperial cities) under one constant H1.
 * The slide labels double as navigation with a progress line; autoplay stops on pause or reduced motion.
 */
export function HeroSlider({ lang, dict }: { lang: Locale; dict: Dictionary["hero"] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const playing = !paused && !reducedMotion;

  const go = useCallback((next: number) => setIndex((next + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [playing, index, go]);

  const current = SLIDES[index];

  return (
    <section aria-roledescription="carousel" aria-label={dict.title} className="relative isolate overflow-hidden bg-navy-deep">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.key}
          aria-hidden={i !== index}
          className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={slide.photo.src}
            alt={dict.slides[slide.key].alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover transition-transform duration-[8000ms] ease-out ${i === index && playing ? "scale-105" : "scale-100"}`}
            style={{ objectPosition: slide.position }}
          />
        </div>
      ))}
      {/* Readability: dark on the text side and at the bottom, the photo stays clear elsewhere. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep/85 via-navy-deep/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-navy-deep/80 to-transparent" />

      <div className="mx-auto flex min-h-[min(82svh,46rem)] max-w-7xl flex-col justify-end px-4 pb-6 pt-24 md:px-8 md:pb-8">
        <div className="max-w-2xl text-white">
          <p className="eyebrow !text-gold-light">{dict.eyebrow}</p>
          <h1 className="font-display mt-3 text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.12] text-white">
            {dict.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">{dict.lead}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={localePath(lang, current.path)} className="btn-gold">
              {dict.primary}
              <Arrow />
            </Link>
            <Link href={localePath(lang, "/contact")} className="btn-outline-light">
              {dict.secondary}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex items-end gap-3 md:mt-14">
          <ol className="grid flex-1 grid-cols-3 gap-3 md:gap-6">
            {SLIDES.map((slide, i) => (
              <li key={slide.key}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? "true" : undefined}
                  className="group w-full text-left"
                >
                  <span className="relative block h-0.5 overflow-hidden bg-white/25">
                    {i === index && (
                      <span
                        key={`${index}-${playing}`}
                        className="absolute inset-0 origin-left bg-gold-light"
                        style={playing ? { animation: `slide-progress ${INTERVAL}ms linear forwards` } : undefined}
                      />
                    )}
                  </span>
                  <span
                    className={`mt-2.5 block text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-colors md:text-sm md:tracking-wider ${
                      i === index ? "text-white" : "text-white/55 group-hover:text-white/85"
                    }`}
                  >
                    {dict.slides[slide.key].label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setPaused(playing)}
            aria-label={playing ? dict.pause : dict.play}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-navy"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
              {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
