import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { CopyGuard } from "@/components/CopyGuard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getSettings } from "@/lib/api";
import { media, site } from "@/lib/site";
import "../globals.css";

const display = Cinzel({ subsets: ["latin"], variable: "--f-display", display: "swap" });
// General Sans (Fontshare, free for commercial use), self-hosted
const body = localFont({
  src: [
    { path: "../fonts/GeneralSans-Regular.woff2", weight: "400" },
    { path: "../fonts/GeneralSans-Medium.woff2", weight: "500" },
    { path: "../fonts/GeneralSans-Semibold.woff2", weight: "600" },
  ],
  variable: "--f-body",
  display: "swap",
});
// third voice: altitudes, coordinates, durations
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.shortName}` },
  applicationName: site.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.name,
    images: [{ url: media.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: [media.ogImage] },
};

export const viewport: Viewport = { themeColor: "#022e55" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([getDictionary(lang), getSettings()]);

  return (
    <html lang={lang} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className={`${settings.copy_protection ? "no-copy " : ""}min-h-screen`}>
        <a
          href="#main"
          className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader lang={lang} dict={dict.nav} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} dict={dict} />
        <WhatsAppButton dict={dict.whatsapp} />
        {settings.copy_protection && <CopyGuard />}
      </body>
    </html>
  );
}
