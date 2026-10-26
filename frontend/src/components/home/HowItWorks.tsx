"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Winding trail across the four waypoints (desktop): column centres 12.5/37.5/62.5/87.5 % of a 1000 x 160 box. */
const TRAIL = "M125 40 C220 40 280 120 375 120 S530 40 625 40 S780 120 875 120";
const WAYPOINT_Y = [40, 120, 40, 120];

/**
 * Four steps from enquiry to pick-up, drawn as waypoints on a trail that traces itself when the
 * section comes into view. Phones: a vertical trail on the left.
 */
export function HowItWorks({ dict }: { dict: Dictionary["steps"] }) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? {}
    : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true, margin: "-20% 0px" }, transition: { duration: 1.8, ease: "easeInOut" as const } };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <p className="eyebrow">{dict.eyebrow}</p>
        <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>

        <div className="relative mt-12">
          <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="absolute inset-x-0 top-0 hidden h-40 w-full lg:block" aria-hidden="true">
            <path d={TRAIL} fill="none" stroke="var(--line)" strokeWidth="2" strokeDasharray="3 7" vectorEffect="non-scaling-stroke" />
            <motion.path d={TRAIL} fill="none" stroke="var(--gold)" strokeWidth="2" {...draw} />
          </svg>
          <span aria-hidden="true" className="absolute bottom-6 left-[1.4rem] top-6 border-l-2 border-dashed border-gold/40 lg:hidden" />

          <ol className="relative grid gap-10 lg:grid-cols-4 lg:gap-0">
            {dict.items.map((step, i) => (
              <li key={step.title} className="relative flex gap-5 lg:block lg:px-4 lg:text-center" style={{ ["--wp" as string]: `${WAYPOINT_Y[i]}px` }}>
                <span className="font-display relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white bg-navy text-lg font-semibold text-white shadow-[0_0_0_1px_var(--line)] lg:mx-auto lg:mt-[calc(var(--wp)-1.5rem)]">
                  {i + 1}
                </span>
                <div className="lg:mx-auto lg:mt-4 lg:max-w-[15rem]">
                  <p className="mono text-gold">{dict.meta[i]}</p>
                  <h3 className="mt-1 font-semibold text-navy">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
