"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Mark } from "@/components/ui/Mark";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

const LINKS = [
  { key: "treks", path: "/treks" },
  { key: "sahara", path: "/sahara-desert-tours" },
  { key: "morocco", path: "/morocco-tours" },
  { key: "dayTrips", path: "/day-trips-from-marrakech" },
] as const;

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
        scrolled || open ? "bg-paper/92 shadow-[0_1px_0_rgba(33,23,15,0.12)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[4.5rem] md:px-10">
        <Link href={href("/")} className="flex items-center gap-2.5 text-ink" onClick={() => setOpen(false)}>
          <Mark className="h-6 w-6 text-terracotta" />
          <span className="display text-[1.55rem] leading-none tracking-[0.01em]">Toubkal Peaks</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <Link key={link.key} href={href(link.path)} className="mono text-ink transition-colors hover:text-terracotta">
              {dict[link.key]}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <LocaleSwitcher current={lang} label={dict.language} />
          <Link href={href("/contact")} className="mono rounded-full bg-ink px-5 py-2.5 text-paper transition-colors hover:bg-terracotta">
            {dict.plan}
          </Link>
        </div>

        <button
          type="button"
          className="mono -mr-2 p-2 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? dict.close : dict.menu}
        </button>
      </div>

    </header>

    {open && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto z-40 bg-paper px-5 pb-10 pt-8 lg:hidden">
          <nav aria-label="Main" className="flex flex-col">
            {LINKS.map((link, i) => (
              <Link
                key={link.key}
                href={href(link.path)}
                onClick={() => setOpen(false)}
                className="display flex items-baseline justify-between border-b border-ink/15 py-4 text-[2.6rem] text-ink"
              >
                {dict[link.key]}
                <span className="mono text-ink-soft">0{i + 1}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-6">
            <Link href={href("/contact")} onClick={() => setOpen(false)} className="mono rounded-full bg-terracotta px-6 py-4 text-center text-paper">
              {dict.plan}
            </Link>
            <LocaleSwitcher current={lang} label={dict.language} className="justify-center text-sm" />
          </div>
        </div>
      )}
    </>
  );
}
