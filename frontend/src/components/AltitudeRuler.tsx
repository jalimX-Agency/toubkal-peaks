"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Real altitudes taken from the itineraries: Marrakech, Imlil, Azib Tamsoult, Toubkal refuge, summit. */
const CAMPS = [
  { key: "marrakech", altitude: 466 },
  { key: "imlil", altitude: 1740 },
  { key: "azib", altitude: 2250 },
  { key: "refuge", altitude: 3200 },
  { key: "summit", altitude: 4167 },
] as const;
const MIN: number = CAMPS[0].altitude;
const MAX: number = CAMPS[CAMPS.length - 1].altitude;
const pct = (altitude: number) => ((altitude - MIN) / (MAX - MIN)) * 100;

/**
 * Signature effect: the whole page is the ascent. A marker climbs a thin vertical ruler as you scroll and its
 * label counts the altitude from Marrakech (466 m) to the Toubkal summit (4,167 m), naming the camp you are passing.
 * One small moving label instead of a fixed legend, so it never fights with the content. Desktop only.
 */
export function AltitudeRuler({ dict }: { dict: Dictionary["ruler"] }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.0005 });
  const altitude = useTransform(progress, [0, 1], [MIN, MAX]);
  const label = useTransform(altitude, (v) => Math.round(v).toLocaleString("en-US"));
  const camp = useTransform(altitude, (v) => {
    let current: string = dict.camps.marrakech;
    for (const c of CAMPS) if (v >= c.altitude - 60) current = dict.camps[c.key];
    return current;
  });
  const markerBottom = useTransform(progress, (p) => `${p * 100}%`);

  return (
    <aside aria-hidden="true" className="pointer-events-none fixed right-3 top-1/2 z-30 hidden h-[44vh] w-32 -translate-y-1/2 lg:block">
      <span className="mono absolute right-4 top-0 -translate-y-1/2 text-[0.58rem] text-ink-soft">{MAX.toLocaleString("en-US")}</span>
      <span className="mono absolute bottom-0 right-4 translate-y-1/2 text-[0.58rem] text-ink-soft">{MIN}</span>

      <div className="absolute inset-y-0 right-0 w-px bg-ink/20" />
      <motion.div style={{ scaleY: progress }} className="absolute bottom-0 right-0 h-full w-px origin-bottom bg-terracotta" />
      {CAMPS.map((c) => (
        <span key={c.key} style={{ bottom: `${pct(c.altitude)}%` }} className="absolute right-0 h-px w-2.5 translate-y-1/2 bg-ink/45" />
      ))}

      <motion.div style={{ bottom: markerBottom }} className="absolute right-0 flex translate-y-1/2 items-center gap-2">
        <div className="flex flex-col items-end gap-0.5">
          <span className="mono flex items-baseline gap-1 bg-ink px-1.5 py-0.5 text-paper">
            <motion.span className="text-[0.78rem] tabular-nums">{label}</motion.span>
            <span className="text-[0.58rem] opacity-70">{dict.unit}</span>
          </span>
          <motion.span className="mono bg-paper/85 px-1.5 text-[0.58rem] text-ink-soft">{camp}</motion.span>
        </div>
        <span className="mr-[-3.5px] block h-[7px] w-[7px] rotate-45 bg-terracotta" />
      </motion.div>
    </aside>
  );
}
