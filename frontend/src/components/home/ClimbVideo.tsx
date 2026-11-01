"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media } from "@/lib/site";

/** Where each moment starts in the footage, in seconds, in the order of the dictionary's chapter names. */
const CHAPTERS = [0, 31, 39, 50, 77, 89];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Phone footage of a Toubkal climb. It plays muted on a loop while on screen (never with reduced
 * motion, where it waits for the play button), and the moments list jumps through the climb.
 */
export function ClimbVideo({ lang, dict }: { lang: Locale; dict: Dictionary["climbVideo"] }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const el = video.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = CHAPTERS.findLastIndex((start) => time >= start);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const jump = (start: number) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = start;
    setTime(start);
    el.play().catch(() => {});
  };

  const round = "flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/70 text-white backdrop-blur transition-colors hover:bg-white hover:text-navy";

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-12 lg:gap-14">
        <div className="relative mx-auto w-full max-w-[20rem] lg:col-span-5 xl:max-w-[22rem]">
          <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-navy-deep shadow-[0_24px_60px_rgba(2,46,85,0.25)]">
            <video
              ref={video}
              src={media.climbVideo}
              poster={media.climbPoster}
              muted={muted}
              loop
              playsInline
              preload="none"
              aria-label={dict.title}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 flex justify-between p-3">
              <button type="button" onClick={toggle} aria-label={playing ? dict.pause : dict.play} className={round}>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                  {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
                </svg>
              </button>
              <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? dict.soundOn : dict.soundOff} aria-pressed={!muted} className={round}>
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M3 8h3l4-3v10l-4-3H3z" fill="currentColor" stroke="none" />
                  {muted ? <path d="M13 8l4 4M17 8l-4 4" /> : <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />}
                </svg>
              </button>
            </div>
            <p className="mono absolute bottom-3 left-3 rounded-sm bg-navy-deep/75 px-2.5 py-1 text-gold-light">▲ 4167 m</p>
          </div>
          <span aria-hidden="true" className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-gold" />
        </div>

        <div className="lg:col-span-7">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{dict.text}</p>

          <h3 className="mono mt-8 text-muted">{dict.chapters}</h3>
          <ol className="mt-3 divide-y divide-line border-y border-line">
            {dict.chapterNames.map((name, i) => {
              const active = playing || time > 0 ? i === current : false;
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => jump(CHAPTERS[i])}
                    aria-current={active ? "step" : undefined}
                    className={`group flex w-full items-center gap-4 py-3 text-left transition-colors ${active ? "text-navy" : "text-muted hover:text-navy"}`}
                  >
                    <span className={`mono w-10 shrink-0 ${active ? "text-gold" : "text-muted group-hover:text-gold"}`}>{clock(CHAPTERS[i])}</span>
                    <span className={`flex-1 ${active ? "font-semibold" : ""}`}>{name}</span>
                    <span aria-hidden="true" className={`h-2 w-2 rotate-45 transition-colors ${active ? "bg-gold" : "bg-line group-hover:bg-gold"}`} />
                  </button>
                </li>
              );
            })}
          </ol>

          <Link href={localePath(lang, "/treks/toubkal")} className="btn-gold mt-8">
            {dict.cta}
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
