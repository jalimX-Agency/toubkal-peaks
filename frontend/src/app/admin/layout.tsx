import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../globals.css";

const display = Cinzel({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = localFont({
  src: [
    { path: "../fonts/GeneralSans-Regular.woff2", weight: "400" },
    { path: "../fonts/GeneralSans-Medium.woff2", weight: "500" },
    { path: "../fonts/GeneralSans-Semibold.woff2", weight: "600" },
  ],
  variable: "--f-body",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Toubkal Peaks admin" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#011d38" };

/** Root of the team admin: separate from the public site (no header, footer, languages or tracking). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
