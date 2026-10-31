import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/home/CtaBand";
import { Arrow } from "@/components/ui/Arrow";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { activities } from "@/content/activities";
import { destinations, type Place } from "@/content/destinations";
import { explore } from "@/content/explore";
import { toubkalGuide } from "@/content/toubkal-guide";
import { hasLocale, localePath, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { TRIPS, site } from "@/lib/site";

const PATH = "/destinations";

export async function generateMetadata({ params }: PageProps<"/[lang]/destinations">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const words = explore[lang];
  return {
    title: words.title,
    description: words.description,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/** Where to go and what to do: every destination and activity page, and the Toubkal guide. */
export default async function DestinationsPage({ params }: PageProps<"/[lang]/destinations">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const words = explore[lang];
  const guide = toubkalGuide[lang];

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: words.title,
    description: words.description,
    url: `${site.url}${localePath(lang, PATH)}`,
    hasPart: [...destinations.map((d) => ({ base: "/destinations", d })), ...activities.map((d) => ({ base: "/activities", d }))].map(({ base, d }) => ({
      "@type": "WebPage",
      name: d.text[lang].name,
      url: `${site.url}${localePath(lang, `${base}/${d.slug}`)}`,
    })),
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={`${TRIPS}/mk3-jemaa-el-fna-and-the-koutoubia-minaret-at-dusk.jpg`} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <p className="mono text-gold-light">{words.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{words.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{words.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <h2 className="heading text-[clamp(1.6rem,3vw,2.4rem)]">{words.destinations}</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((d) => <PlaceCard key={d.slug} place={d} href={localePath(lang, `/destinations/${d.slug}`)} lang={lang} />)}
        </ul>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:px-8 lg:grid-cols-12">
          <div className="relative aspect-[16/9] overflow-hidden rounded-sm lg:col-span-5">
            <Image src={`${TRIPS}/o58-trekkers-at-the-summit-of-toubkal-4-167-m.jpg`} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="lg:col-span-7">
            <p className="mono text-gold-light">{words.guide} · ▲ 4167 m</p>
            <h2 className="font-display mt-3 text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight">{words.guideLink}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-white/80">{guide.lead}</p>
            <Link href={localePath(lang, "/toubkal-guide")} className="btn-gold mt-7">
              {words.discover}
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section id="activities" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 md:px-8 md:py-20">
        <h2 className="heading text-[clamp(1.6rem,3vw,2.4rem)]">{words.activities}</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {activities.map((a) => <PlaceCard key={a.slug} place={a} href={localePath(lang, `/activities/${a.slug}`)} lang={lang} />)}
        </ul>
      </section>

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}

function PlaceCard({ place, href, lang }: { place: Place; href: string; lang: Locale }) {
  const text = place.text[lang];
  return (
    <li>
      <Link href={href} className="group block overflow-hidden rounded-sm border border-line bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <Image src={`${TRIPS}/${place.image}`} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-navy">{text.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{text.lead}</p>
        </div>
      </Link>
    </li>
  );
}
