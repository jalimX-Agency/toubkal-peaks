"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { ApiImage } from "@/lib/types";

const SIZES = "(min-width: 1280px) 600px, (min-width: 768px) 50vw, 100vw";

/**
 * The photo area of a trip card: a small carousel (arrows, dots, swipe). Only the main photo loads with
 * the page; the others are added once the visitor shows interest in this card (pointer over it, touch,
 * focus), one ahead of the photo on screen, so a page of cards costs no more than before.
 */
export function CardPhotos({
  href,
  title,
  images,
  labels,
}: {
  href: string;
  title: string;
  images: ApiImage[];
  labels: { prev: string; next: string; photo: string };
}) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0); // highest photo index allowed to load
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const warm = () => setLoaded((l) => Math.max(l, Math.min(1, count - 1)));
  const show = (i: number) => {
    const next = (i + count) % count;
    setIndex(next);
    setLoaded((l) => Math.max(l, Math.min(next + 1, count - 1), next));
  };
  const step = (e: React.MouseEvent, by: number) => {
    e.preventDefault();
    e.stopPropagation();
    show(index + by);
  };

  const arrow =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow transition-opacity hover:bg-white focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100";

  return (
    <div
      className="relative z-10 aspect-[3/2] w-full flex-1 overflow-hidden bg-sand"
      onPointerEnter={warm}
      onFocus={warm}
      onTouchStart={(e) => {
        warm();
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || count < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
      }}
    >
      <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
        {images.map((img, i) =>
          i === 0 || i <= loaded ? (
            <Image
              key={img.url}
              src={img.url}
              alt={i === index ? img.alt || title : ""}
              fill
              sizes={SIZES}
              loading={i === 0 ? undefined : "eager"}
              className={`object-cover transition-[opacity,transform] duration-500 group-hover:scale-105 ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ) : null,
        )}
      </Link>

      {count > 1 && (
        <>
          <button type="button" aria-label={labels.prev} onClick={(e) => step(e, -1)} className={`${arrow} left-2`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" aria-label={labels.next} onClick={(e) => step(e, 1)} className={`${arrow} right-2`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5" aria-live="polite">
            <span className="sr-only">{labels.photo.replace("{n}", String(index + 1)).replace("{total}", String(count))}</span>
            {images.map((img, i) => (
              <span key={img.url} aria-hidden="true" className={`h-1.5 rounded-full bg-white shadow transition-all ${i === index ? "w-4" : "w-1.5 opacity-60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
