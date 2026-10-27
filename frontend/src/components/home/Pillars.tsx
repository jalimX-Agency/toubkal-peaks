"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "@/components/ui/Arrow";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { stock } from "@/lib/site";

export type PillarKey = "treks" | "sahara" | "cities" | "dayTrips";

const PILLARS: { key: PillarKey; path: string; photo: { src: string }; accent: string; position: string; legend: string }[] = [
  { key: "treks", path: "/treks", photo: stock.atlasValley, accent: "bg-atlas", position: "50% 50%", legend: "Toubkal ▲ 4167 m" },
  { key: "sahara", path: "/sahara-desert-tours", photo: stock.saharaCaravan, accent: "bg-sahara", position: "50% 62%", legend: "Merzouga ▲ 700 m" },
  { key: "cities", path: "/morocco-tours", photo: stock.koutoubia, accent: "bg-imperial", position: "50% 30%", legend: "Marrakech ▲ 466 m" },
  { key: "dayTrips", path: "/day-trips-from-marrakech", photo: stock.atlasFoothills, accent: "bg-gold", position: "50% 50%", legend: "Marrakech ↔ 0–200 km" },
];

function Panel({ p, i, lang, dict, count, className = "" }: { p: (typeof PILLARS)[number]; i: number; lang: Locale; dict: Dictionary["pillars"]; count: number; className?: string }) {
  const item = dict.items[p.key];
  return (
    <Link href={localePath(lang, p.path)} className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-sm text-white ${className}`}>
      <Image
        src={p.photo.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
        style={{ objectPosition: p.position }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-deep/95 via-navy-deep/45 to-navy-deep/5" />
      <span className={`absolute inset-x-0 top-0 h-1 ${p.accent}`} />
      <div className="p-6 md:p-9">
        <p className="mono flex flex-wrap gap-x-3 text-gold-light">
          <span>
            {String(i + 1).padStart(2, "0")} / {String(PILLARS.length).padStart(2, "0")}
          </span>
          <span className="text-white/70">{p.legend}</span>
        </p>
        <h3 className="font-display mt-3 text-[clamp(1.6rem,3vw,2.6rem)] font-semibold leading-tight">{item.name}</h3>
        <p className="mt-3 max-w-md text-white/80">{item.text}</p>
        <p className="mt-6 flex items-center gap-5 text-sm font-semibold">
          {count > 0 && (
            <span className="mono text-white/70">
              {count} {dict.trips}
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-gold-light">
            {dict.view}
            <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </p>
      </div>
    </Link>
  );
}

/**
 * The four service lines as a journey. Desktop: the section pins and vertical scrolling moves the
 * panels sideways, like travelling across the country. Phones and reduced motion: stacked panels.
 */
export function Pillars({ lang, dict, counts }: { lang: Locale; dict: Dictionary["pillars"]; counts: Record<PillarKey, number> }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setDistance(Math.max(0, el.scrollWidth - window.innerWidth)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const header = (
    <div className="max-w-sm shrink-0">
      <p className="eyebrow">{dict.eyebrow}</p>
      <h2 className="heading mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
      <p className="mono mt-6 flex items-center gap-3 text-muted">
        {dict.hint}
        <span aria-hidden="true" className="h-px w-12 bg-gold" />
      </p>
    </div>
  );

  return (
    <>
      {/* phones: swipe sideways, one panel at a time with the next one peeking; tablets (and reduced motion): grid */}
      <section className={`mx-auto max-w-7xl px-4 py-16 md:px-8 ${reduce ? "" : "lg:hidden"}`}>
        {header}
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0">
          {PILLARS.map((p, i) => (
            <Panel key={p.key} p={p} i={i} lang={lang} dict={dict} count={counts[p.key]} className="min-h-[28rem] w-[84%] shrink-0 snap-start md:w-auto" />
          ))}
        </div>
      </section>

      {/* desktop: pinned horizontal journey */}
      {!reduce && (
        <section ref={section} className="relative hidden h-[300vh] lg:block">
          <div className="sticky top-20 flex h-[calc(100svh-5rem)] items-center overflow-hidden">
            <motion.div ref={track} style={{ x }} className="flex h-[78%] items-stretch gap-6 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-8">
              <div className="flex w-[22rem] shrink-0 flex-col justify-center">{header}</div>
              {PILLARS.map((p, i) => (
                <Panel key={p.key} p={p} i={i} lang={lang} dict={dict} count={counts[p.key]} className="w-[min(58vw,52rem)] shrink-0" />
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
