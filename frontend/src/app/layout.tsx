import type { Metadata } from "next";
import { Cinzel, Josefin_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Toubkal Peaks | Trekking & Expeditions in the High Atlas",
    template: "%s | Toubkal Peaks",
  },
  description:
    "Guided treks and expeditions to Mount Toubkal and the High Atlas, Morocco.",
  openGraph: {
    type: "website",
    siteName: "Toubkal Peaks",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cinzel.variable} ${josefin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
