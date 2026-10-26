import { cacheLife } from "next/cache";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Mark } from "@/components/ui/Mark";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site, whatsappLink } from "@/lib/site";

/** The current year, cached: reading the clock directly would make the whole footer dynamic. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = await currentYear();
  const href = (path: string) => localePath(lang, path);
  const links = [
    { label: dict.nav.treks, path: "/treks" },
    { label: dict.nav.sahara, path: "/sahara-desert-tours" },
    { label: dict.nav.morocco, path: "/morocco-tours" },
    { label: dict.nav.dayTrips, path: "/day-trips-from-marrakech" },
  ];

  return (
    <footer className="bg-night text-paper">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5">
            <Mark className="h-7 w-7 text-terracotta" />
            <span className="display text-4xl leading-none">Toubkal Peaks</span>
          </div>
          <p className="mt-5 max-w-sm text-paper/70">{dict.footer.tagline}</p>
          <LocaleSwitcher current={lang} label={dict.nav.language} className="mt-8 [&_a]:text-paper/60 [&_a[aria-current]]:text-paper" />
        </div>

        <nav aria-label={dict.footer.explore} className="md:col-span-3 md:col-start-7">
          <p className="mono text-paper/50">{dict.footer.explore}</p>
          <ul className="mt-4 space-y-2">
            {links.map((l) => (
              <li key={l.path}>
                <Link href={href(l.path)} className="transition-colors hover:text-ochre">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="mono text-paper/50">{dict.footer.contact}</p>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-ochre">
                {site.email}
              </a>
            </li>
            <li>
              <a href={whatsappLink()} className="transition-colors hover:text-ochre" rel="noopener noreferrer" target="_blank">
                WhatsApp {site.whatsappDisplay}
              </a>
            </li>
            <li className="text-paper/70">{dict.footer.basedIn}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="mono mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-paper/50 md:px-10">
          <span>
            © {year} {site.name}. {dict.footer.rights}
          </span>
          <Link href={href("/privacy-policy")} className="transition-colors hover:text-paper">
            {dict.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  );
}
