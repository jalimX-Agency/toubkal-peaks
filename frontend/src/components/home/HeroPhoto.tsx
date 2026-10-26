"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/** Hero photo cut along a mountain skyline. It drifts and settles slightly as the page scrolls. */
export function HeroPhoto({ src, width, height, alt, caption }: { src: string; width: number; height: number; alt: string; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 1.06, 1]);

  return (
    <div ref={ref} className="ridge-top relative h-[72vw] min-h-[340px] w-full overflow-hidden bg-paper-2 lg:h-[84svh]">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="h-full w-full object-cover object-[50%_40%]"
        />
      </motion.div>
      <p className="mono absolute bottom-4 left-4 bg-ink/85 px-2.5 py-1.5 text-paper">{caption}</p>
    </div>
  );
}
