import type { Metadata } from "next";
import { Big_Shoulders, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { AltitudeRuler } from "@/components/AltitudeRuler";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import "../globals.css";

const display = Big_Shoulders({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}`, template: `%s | ${site.shortName}` },
  applicationName: site.name,
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: site.name },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen">
        <a
          href="#main"
          className="mono fixed left-4 top-4 z-[70] -translate-y-20 bg-ink px-4 py-2 text-paper transition-transform focus:translate-y-0"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader lang={lang} dict={dict.nav} />
        <AltitudeRuler dict={dict.ruler} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} dict={dict} />
      </body>
    </html>
  );
}
