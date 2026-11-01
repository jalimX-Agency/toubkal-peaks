"use client";

import Image from "next/image";
import { useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** One large photo of the riad and a row of thumbnails that swap it. */
export function RiadGallery({ photos, dict }: { photos: string[]; dict: Dictionary["riad"] }) {
  const [current, setCurrent] = useState(0);
  const shown = dict.gallery[current];

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-navy-deep">
        {photos.map((src, i) => (
          <Image
            key={src}
            src={src}
            fill
            alt={i === current ? dict.gallery[i].alt : ""}
            aria-hidden={i !== current}
            sizes="(min-width: 1024px) 700px, 100vw"
            priority={false}
            loading={i === 0 ? "eager" : "lazy"}
            className={`object-cover transition-opacity duration-500 ${i === 0 ? "object-[50%_35%]" : ""} ${i === current ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-deep/70 to-transparent" />
        <p className="mono absolute bottom-4 left-4 rounded-sm bg-navy-deep/80 px-3 py-1.5 text-gold-light">Imlil ▲ 1740 m</p>
        <p aria-live="polite" className="absolute bottom-4 right-4 text-sm font-semibold text-white">
          {shown.caption} <span className="mono ml-2 text-white/60">{String(current + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
        </p>
      </div>
      <ul className="mt-3 grid grid-cols-7 gap-2">
        {photos.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={dict.show.replace("{caption}", dict.gallery[i].caption)}
              aria-pressed={i === current}
              className={`relative block aspect-square w-full overflow-hidden rounded-sm transition ${
                i === current ? "ring-2 ring-gold-light ring-offset-2 ring-offset-navy" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} fill alt="" sizes="100px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
