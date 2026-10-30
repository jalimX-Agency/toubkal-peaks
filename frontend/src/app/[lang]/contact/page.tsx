import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/trip/BookingForm";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site, whatsappLink, pageHeroes } from "@/lib/site";

const PATH = "/contact";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { contact } = await getDictionary(lang);
  return {
    title: contact.metaTitle,
    description: contact.metaDescription,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/** Contact and trip planning: direct channels on one side, the general enquiry form on the other. */
export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { contact } = dict;

  const channels = [
    { label: contact.whatsapp, value: site.whatsappDisplay, href: whatsappLink(dict.whatsapp.message), external: true },
    ...site.phones.map((p) => ({ label: contact.phone, value: p, href: `tel:${p.replace(/\s/g, "")}`, external: false })),
    ...[site.email, site.contactEmail].map((e) => ({ label: contact.email, value: e, href: `mailto:${e}`, external: false })),
    { label: contact.reservations, value: site.reservationsEmail, href: `mailto:${site.reservationsEmail}`, external: false },
  ];

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: contact.metaTitle,
    url: `${site.url}${localePath(lang, PATH)}`,
    mainEntity: {
      "@type": "TravelAgency",
      name: site.name,
      email: [site.email, site.contactEmail, site.reservationsEmail],
      telephone: site.phones,
      address: { "@type": "PostalAddress", streetAddress: site.address.street, addressLocality: site.city, addressRegion: site.address.region, postalCode: site.address.postalCode, addressCountry: site.country },
    },
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={pageHeroes.contact} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <p className="mono text-gold-light">{contact.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{contact.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{contact.lead}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-12 lg:gap-14">
        <aside className="lg:col-span-4">
          <h2 className="heading text-2xl">{contact.reach}</h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {channels.map((c) => (
              <li key={c.href} className="py-4">
                <p className="mono text-gold">{c.label}</p>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="mt-1 block text-lg font-semibold text-navy transition-colors hover:text-gold"
                >
                  {c.value}
                </a>
              </li>
            ))}
            <li className="py-4">
              <p className="mono text-gold">{contact.based}</p>
              <p className="mt-1 text-ink">{contact.basedValue}</p>
            </li>
            <li className="py-4">
              <p className="mono text-gold">{contact.languages}</p>
              <p className="mt-1 text-ink">{contact.languagesValue}</p>
            </li>
          </ul>
        </aside>

        <section className="lg:col-span-8">
          <h2 className="heading text-2xl">{contact.formTitle}</h2>
          <p className="mt-2 text-muted">{contact.formText}</p>
          <div className="mt-6">
            <BookingForm lang={lang} dict={dict.booking} tiers={[]} currency="EUR" />
          </div>
        </section>
      </div>
    </>
  );
}
