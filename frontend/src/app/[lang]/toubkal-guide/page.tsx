import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TourCard } from "@/components/TourCard";
import { CtaBand } from "@/components/home/CtaBand";
import { Arrow } from "@/components/ui/Arrow";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { explore } from "@/content/explore";
import { toubkalGuide } from "@/content/toubkal-guide";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTours } from "@/lib/api";
import { TRIPS, site } from "@/lib/site";

const PATH = "/toubkal-guide";
const IMAGE = `${TRIPS}/o57-trekkers-on-the-snowy-slopes-below-toubkal.jpg`;

export async function generateMetadata({ params }: PageProps<"/[lang]/toubkal-guide">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const guide = toubkalGuide[lang];
  return {
    title: { absolute: guide.title },
    description: guide.description,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
    openGraph: { type: "article", title: guide.title, description: guide.description, url: localePath(lang, PATH), images: [IMAGE] },
  };
}

/** The Mount Toubkal climbing guide: practical sections, frequent questions, then the Toubkal trips. */
export default async function ToubkalGuidePage({ params }: PageProps<"/[lang]/toubkal-guide">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tours] = await Promise.all([getDictionary(lang), getTours({ locale: lang, category: "treks.toubkal", perPage: 8 })]);
  const guide = toubkalGuide[lang];
  const words = explore[lang];
  const url = `${site.url}${localePath(lang, PATH)}`;

  const jsonLd = JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      image: IMAGE,
      url,
      inLanguage: lang,
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
      about: { "@type": "Mountain", name: "Jbel Toubkal", elevation: "4167 m" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ]).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={IMAGE} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 md:px-8 md:pb-16 md:pt-10">
          <nav aria-label="Breadcrumb" className="mono text-white/55">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href={localePath(lang, "/")} className="hover:text-white">{dict.trip.home}</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={localePath(lang, "/destinations")} className="hover:text-white">{words.title}</Link></li>
            </ol>
          </nav>
          <p className="mono mt-6 text-gold-light">{guide.eyebrow} · ▲ 4167 m</p>
          <h1 className="font-display mt-3 max-w-4xl text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.1]">{guide.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{guide.lead}</p>
        </div>
      </section>

      <section className="border-b border-line bg-sand/70">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 py-6 sm:grid-cols-3 md:px-8 lg:grid-cols-6">
          {guide.facts.map((f) => (
            <div key={f.label} className="px-2 py-2">
              <dt className="mono text-[0.7rem] uppercase text-muted">{f.label}</dt>
              <dd className="mt-1 font-semibold text-navy">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
        {guide.sections.map((s) => (
          <section key={s.heading} className="mb-12 last:mb-0">
            <h2 className="heading text-[clamp(1.5rem,2.6vw,2rem)]">{s.heading}</h2>
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink">
              {s.body.map((p) => <p key={p}>{p}</p>)}
            </div>
            {s.list && (
              <ul className="mt-4 space-y-2.5">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-3 text-ink">
                    <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-14 border-t border-line pt-10">
          <h2 className="heading text-[clamp(1.5rem,2.6vw,2rem)]">{guide.faqTitle}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {guide.faq.map((f) => (
              <details key={f.q} className="group py-1">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-semibold text-navy [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-gold transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 pr-10 leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      {tours.data.length > 0 && (
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <h2 className="heading text-[clamp(1.6rem,3vw,2.4rem)]">{guide.cta.title}</h2>
                <p className="mt-3 leading-relaxed text-muted">{guide.cta.text}</p>
              </div>
              <Link href={localePath(lang, "/treks/toubkal")} className="btn-outline-navy">
                {guide.cta.button}
                <Arrow />
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tours.data.map((t) => (
                <li key={t.id}>
                  <TourCard tour={t} lang={lang} dict={dict.tours} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
