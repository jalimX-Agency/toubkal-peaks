import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/home/CtaBand";
import { hasLocale, localePath, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { media, site } from "@/lib/site";

const PATH = "/about";

/** Team photos live in public/team, in the same order as dict.about.members. */
const PHOTOS = ["/team/omar-jellah.jpg", "/team/rachid-ait-lmouden.jpg"];

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { about } = await getDictionary(lang);
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/** Who is behind the company: a short introduction, then one card per team member. */
export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { about } = dict;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: about.metaTitle,
    url: `${site.url}${localePath(lang, PATH)}`,
    mainEntity: {
      "@type": "TravelAgency",
      name: site.name,
      url: site.url,
      employee: about.members.map((m) => ({ "@type": "Person", name: m.name, jobTitle: m.role })),
    },
  }).replace(/</g, "\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.16]" style={{ backgroundImage: `url(${media.topo})` }} />
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <p className="mono text-gold-light">{about.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2.1rem,4.6vw,3.6rem)] font-semibold leading-[1.08]">{about.title}</h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-white/80 md:text-lg">{about.lead}</p>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
          <h2 className="heading text-2xl md:text-3xl">{about.team}</h2>
          <ul className="mt-10 space-y-14 md:space-y-20">
            {about.members.map((member, i) => (
              <li key={member.name} className="grid items-start gap-6 md:grid-cols-12 md:gap-12">
                <div className={`relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-sm bg-line md:col-span-4 ${i % 2 ? "md:order-2 md:col-start-9" : ""}`}>
                  <Image src={PHOTOS[i]} alt={member.photoAlt} fill sizes="(min-width: 768px) 30vw, 90vw" className="object-cover" />
                </div>
                <div className={`md:col-span-7 ${i % 2 ? "md:order-1" : "md:col-start-6"}`}>
                  <p className="mono text-gold">{member.role}</p>
                  <h3 className="font-display mt-2 text-[clamp(1.7rem,3vw,2.4rem)] font-semibold leading-tight text-navy">{member.name}</h3>
                  <div className="mt-5 space-y-4 leading-relaxed text-ink">
                    {member.bio.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand lang={lang} dict={dict.cta} message={dict.whatsapp.message} />
    </>
  );
}
