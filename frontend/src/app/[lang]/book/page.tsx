import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingWizardLoader } from "@/components/book/BookingWizardLoader";
import { HeroBackdrop } from "@/components/ui/HeroBackdrop";
import { hasLocale, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { getDictionary } from "@/i18n/get-dictionary";
import { getTours } from "@/lib/api";
import { pageHeroes } from "@/lib/site";

const PATH = "/book";

export async function generateMetadata({ params }: PageProps<"/[lang]/book">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { book } = await getDictionary(lang);
  return {
    title: book.metaTitle,
    description: book.metaDescription,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

/** Reservation request: a short header and the step-by-step wizard (?trip=<slug> preselects a trip). */
export default async function BookPage({ params }: PageProps<"/[lang]/book">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <section data-dark-hero className="relative isolate overflow-hidden bg-navy-deep pt-[4.25rem] text-white md:pt-20">
        <HeroBackdrop src={pageHeroes.book} />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
          <p className="mono text-gold-light">{dict.book.eyebrow}</p>
          <h1 className="font-display mt-2 text-[clamp(1.9rem,4.2vw,3.2rem)] font-semibold leading-[1.08]">{dict.book.title}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/80">{dict.book.lead}</p>
        </div>
      </section>
      {/* the trip list and ?trip= (read from the URL) stream in below the static header */}
      <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-6xl px-4 md:px-8" />}>
        <Wizard lang={lang} dict={dict} />
      </Suspense>
    </>
  );
}

async function Wizard({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { data } = await getTours({ locale: lang, perPage: 100 });
  // only what the trip picker shows (no summaries or carousel photos): a lighter page
  const tours = data.map((x) => ({ ...x, summary: null, photos: undefined }));
  return <BookingWizardLoader lang={lang} tours={tours} t={dict.book} tabs={dict.tours.tabs} toursDict={dict.tours} whatsappMessage={dict.whatsapp.message} />;
}
