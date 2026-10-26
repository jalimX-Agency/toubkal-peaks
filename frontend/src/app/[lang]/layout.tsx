import type { Metadata, Viewport } from "next";
import { Cinzel, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { site } from "@/lib/site";
import "../globals.css";

const display = Cinzel({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Montserrat({ subsets: ["latin"], variable: "--f-body", display: "swap" });

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
    images: [{ url: "/brand/og-default.jpg", width: 1200, height: 630, alt: site.name }],
  },
  twitter: { card: "summary_large_image", images: ["/brand/og-default.jpg"] },
};

export const viewport: Viewport = { themeColor: "#022e55" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
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
      </body>
    </html>
  );
}
