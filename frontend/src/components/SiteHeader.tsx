"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, site } from "@/lib/site";

type MenuLink = { label: string; path: string };
/** A plain link, or a group that opens a list of links with an "all" link at its foot. */
export type MenuEntry = MenuLink | { label: string; items: MenuLink[]; all: MenuLink };

export function SiteHeader({ lang, dict, menu }: { lang: Locale; dict: Dictionary["nav"]; menu: MenuEntry[] }) {
  const [open, setOpen] = useState(false);
  // the desktop group opened by click or keyboard (hover opens them too), and the mobile group unfolded
  const [group, setGroup] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  // The bar floats over every page's dark hero (marked data-dark-hero), transparent until the visitor
  // scrolls. A page that starts with light content (404) keeps the cream bar. Checked again after
  // each navigation; the first render assumes a hero, as nearly every page has one.
  const [overHero, setOverHero] = useState(true);
  const pathname = usePathname();
  const clear = overHero && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const measure = () => {
      const hero = document.querySelector("#main [data-dark-hero]");
      setOverHero(hero !== null && hero.getBoundingClientRect().top + window.scrollY < 8);
      onScroll();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!group) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setGroup(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [group]);

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
            {menu.map((entry) => {
              const tone = clear ? "text-white hover:text-gold-light" : "text-navy hover:text-gold";
              if (!("items" in entry)) {
                return (
                  <Link key={entry.path} href={href(entry.path)} className={`whitespace-nowrap text-[0.92rem] font-semibold transition-colors ${tone}`}>
                    {entry.label}
                  </Link>
                );
              }
              const isOpen = group === entry.label;
              return (
                <div key={entry.label} className="group relative" onMouseLeave={() => setGroup(null)}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setGroup(isOpen ? null : entry.label)}
                    className={`flex items-center gap-1 whitespace-nowrap py-2 text-[0.92rem] font-semibold transition-colors ${tone}`}
                  >
                    {entry.label}
                    <svg viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : "group-hover:rotate-180"}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2.5 4.5 6 8l3.5-3.5" />
                    </svg>
                  </button>
                  {/* the gap above the panel is padding, so the pointer can travel down without closing it */}
                  <div className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 ${isOpen ? "block" : "hidden group-hover:block"}`}>
                    <ul className="min-w-60 rounded-sm border border-line bg-cream py-2 shadow-[0_12px_32px_rgba(2,46,85,0.14)]">
                      {entry.items.map((item) => (
                        <li key={item.path}>
                          <Link href={href(item.path)} onClick={() => setGroup(null)} className="block whitespace-nowrap px-5 py-2 text-[0.92rem] text-navy transition-colors hover:bg-sand hover:text-gold">
                            {item.label}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-line pt-1">
                        <Link href={href(entry.all.path)} onClick={() => setGroup(null)} className="flex items-center justify-between gap-4 whitespace-nowrap px-5 py-2 text-[0.92rem] font-semibold text-navy transition-colors hover:text-gold">
                          {entry.all.label}
                          <span aria-hidden="true" className="text-gold">→</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              );
            })}
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
            {menu.map((entry) => {
              const row = "heading flex w-full items-center justify-between border-b border-line py-4 text-left text-2xl";
              if (!("items" in entry)) {
                return (
                  <Link key={entry.path} href={href(entry.path)} onClick={() => setOpen(false)} className={row}>
                    {entry.label}
                    <span aria-hidden="true" className="text-gold">›</span>
                  </Link>
                );
              }
              const unfolded = section === entry.label;
              return (
                <div key={entry.label}>
                  <button type="button" aria-expanded={unfolded} onClick={() => setSection(unfolded ? null : entry.label)} className={row}>
                    {entry.label}
                    <span aria-hidden="true" className={`text-gold transition-transform ${unfolded ? "rotate-90" : ""}`}>›</span>
                  </button>
                  {unfolded && (
                    <ul className="border-b border-line py-2">
                      {[...entry.items, entry.all].map((item, i) => (
                        <li key={item.path}>
                          <Link
                            href={href(item.path)}
                            onClick={() => setOpen(false)}
                            className={`block py-2.5 pl-4 text-lg text-navy ${i === entry.items.length ? "font-semibold" : ""}`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
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
