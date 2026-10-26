"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/lib/site";

const LINKS = [
  { key: "treks", path: "/treks" },
  { key: "sahara", path: "/sahara-desert-tours" },
  { key: "morocco", path: "/morocco-tours" },
  { key: "dayTrips", path: "/day-trips-from-marrakech" },
  { key: "contact", path: "/contact" },
] as const;

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const href = (path: string) => localePath(lang, path);

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-cream transition-shadow duration-300 ${
          scrolled || open ? "shadow-[0_1px_0_var(--line),0_6px_20px_rgba(2,46,85,0.06)]" : ""
        }`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-4 md:h-20 md:px-8">
          <Link href={href("/")} className="shrink-0" onClick={() => setOpen(false)}>
            <Image
              src="/brand/logo-horizontal.png"
              alt={site.name}
              width={595}
              height={128}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 xl:flex">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={href(link.path)}
                className="text-[0.92rem] font-semibold text-navy transition-colors hover:text-gold"
              >
                {dict[link.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <LocaleSwitcher current={lang} label={dict.language} />
            <Link href={href("/contact")} className="btn-gold !px-5 !py-3">
              {dict.plan}
            </Link>
          </div>

          <button
            type="button"
            className="-mr-2 inline-flex items-center gap-2 p-2 text-sm font-semibold text-navy xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only sm:not-sr-only">{open ? dict.close : dict.menu}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {/* Kept outside <header> so it is never clipped by the header's stacking context. */}
      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 overflow-y-auto bg-cream px-4 pb-10 pt-4 md:top-20 md:px-8 xl:hidden"
        >
          <nav aria-label="Main" className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={href(link.path)}
                onClick={() => setOpen(false)}
                className="heading flex items-center justify-between border-b border-line py-4 text-2xl"
              >
                {dict[link.key]}
                <span aria-hidden="true" className="text-gold">›</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col items-center gap-6">
            <Link href={href("/contact")} onClick={() => setOpen(false)} className="btn-gold w-full">
              {dict.plan}
            </Link>
            <LocaleSwitcher current={lang} label={dict.language} className="text-base" />
          </div>
        </div>
      )}
    </>
  );
}
