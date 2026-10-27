import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { media, site, whatsappLink } from "@/lib/site";

/** The current year, cached: reading the clock directly would make the whole footer dynamic. */
async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = await currentYear();
  const href = (path: string) => localePath(lang, path);
  const trips = [
    { label: dict.pillars.items.treks.name, path: "/treks" },
    { label: dict.pillars.items.sahara.name, path: "/sahara-desert-tours" },
    { label: dict.pillars.items.cities.name, path: "/morocco-tours" },
    { label: dict.pillars.items.dayTrips.name, path: "/day-trips-from-marrakech" },
  ];
  const linkClass = "text-white/75 transition-colors hover:text-gold-light";

  return (
    <footer className="relative isolate overflow-hidden bg-navy-deep text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.07]" style={{ backgroundImage: `url(${media.topo})` }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 md:px-8 md:py-16 lg:grid-cols-12">
        <div className="sm:col-span-2 lg:col-span-4">
          <Image src={media.logoOnDark.src} alt={site.name} width={595} height={128} className="h-12 w-auto" />
          <p className="mt-5 max-w-xs text-white/70">{dict.footer.tagline}</p>
          <LocaleSwitcher current={lang} label={dict.nav.language} tone="light" className="mt-6 -ml-1.5" />
        </div>

        <nav aria-label={dict.footer.trips} className="lg:col-span-3 lg:col-start-6">
          <p className="eyebrow !text-gold-light">{dict.footer.trips}</p>
          <ul className="mt-4 space-y-2.5">
            {trips.map((l) => (
              <li key={l.path}>
                <Link href={href(l.path)} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className="eyebrow !text-gold-light">{dict.footer.contact}</p>
          <ul className="mt-4 space-y-3">
            <li>
              <span className="block text-xs uppercase tracking-wider text-white/45">{dict.footer.phone}</span>
              {site.phones.map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\s/g, "")}`} className={`${linkClass} block`}>
                  {phone}
                </a>
              ))}
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-white/45">{dict.footer.email}</span>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
            </li>
            <li>
              <a href={whatsappLink(dict.whatsapp.message)} target="_blank" rel="noopener noreferrer" className={linkClass}>
                WhatsApp {site.whatsappDisplay}
              </a>
            </li>
            <li className="text-white/60">{dict.footer.basedIn}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-white/55 md:px-8">
          <span>
            © {year} {site.name}. {dict.footer.rights}
          </span>
          <p className="mono flex flex-wrap gap-x-4 gap-y-1 text-white/45" aria-label={dict.footer.company}>
            {site.registration.map((r) => (
              <span key={r.label}>
                {r.label} <span className="text-white/70">{r.value}</span>
              </span>
            ))}
          </p>
          <span className="flex gap-5">
            <Link href={href("/legal-notice")} className="transition-colors hover:text-white">
              {dict.footer.legal}
            </Link>
            <Link href={href("/privacy-policy")} className="transition-colors hover:text-white">
              {dict.footer.privacy}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
