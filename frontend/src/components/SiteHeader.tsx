"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, site } from "@/lib/site";

// the categories are listed in the footer and on /trips: the bar keeps only what fits on one line
const LINKS = [
  { key: "trips", path: "/trips" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
] as const;

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // home page: the bar floats over the hero photo, transparent until the visitor scrolls
  const isHome = /^\/(?:(?:fr|es|de)\/?)?$/.test(usePathname());
  const clear = isHome && !scrolled && !open;

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
        className={`${isHome ? "fixed inset-x-0" : "sticky"} top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
          clear ? "bg-gradient-to-b from-navy-deep/55 to-transparent" : "bg-cream"
        } ${scrolled || open ? "shadow-[0_1px_0_var(--line),0_6px_20px_rgba(2,46,85,0.06)]" : ""}`}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-4 md:h-20 md:px-8">
          <Link href={href("/")} className="shrink-0" onClick={() => setOpen(false)}>
            <Image
              src={clear ? media.logoOnDark.src : media.logo.src}
              alt={site.name}
              width={595}
              height={128}
              priority
              className="h-10 w-auto md:h-12"
            />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-5 xl:flex 2xl:gap-7">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={href(link.path)}
                className={`text-[0.92rem] font-semibold transition-colors ${clear ? "text-white hover:text-gold-light" : "text-navy hover:text-gold"}`}
              >
                {dict[link.key]}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <LocaleSwitcher current={lang} label={dict.language} tone={clear ? "light" : "dark"} />
            <Link href={href("/book")} className="btn-gold !px-5 !py-3">
              {dict.plan}
            </Link>
          </div>

          <button
            type="button"
            className={`-mr-2 inline-flex items-center gap-2 p-2 text-sm font-semibold xl:hidden ${clear ? "text-white" : "text-navy"}`}
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
            <Link href={href("/book")} onClick={() => setOpen(false)} className="btn-gold w-full">
              {dict.plan}
            </Link>
            <LocaleSwitcher current={lang} label={dict.language} className="text-base" />
          </div>
        </div>
      )}
    </>
  );
}
