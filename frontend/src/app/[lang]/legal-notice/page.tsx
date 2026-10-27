import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPageView } from "@/components/LegalPageView";
import { legal } from "@/content/legal";
import { hasLocale, localePath, locales } from "@/i18n/config";

const PATH = "/legal-notice";

export async function generateMetadata({ params }: PageProps<"/[lang]/legal-notice">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const page = legal[lang].notice;
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: localePath(lang, PATH),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, PATH)])), "x-default": PATH },
    },
  };
}

export default async function LegalNoticePage({ params }: PageProps<"/[lang]/legal-notice">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <LegalPageView page={legal[lang].notice} />;
}
