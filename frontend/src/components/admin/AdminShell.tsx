"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import type { AdminUser } from "@/lib/admin/types";
import { media } from "@/lib/site";

type Item = { href: string; label: string; icon: keyof typeof ICONS; adminOnly?: boolean };

const NAV: Item[] = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/bookings", label: "Bookings", icon: "inbox" },
  { href: "/admin/trips", label: "Trips", icon: "map" },
  { href: "/admin/reviews", label: "Reviews", icon: "star" },
  { href: "/admin/people", label: "Team page", icon: "id" },
  { href: "/admin/team", label: "Accounts", icon: "users", adminOnly: true },
  { href: "/admin/account", label: "Account", icon: "user" },
];

const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  inbox: "M4 4h16v10h-5l-1.5 3h-3L9 14H4zM4 14v6h16v-6",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  users: "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8",
  user: "M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  id: "M4 5h16v14H4zM9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M6 16a3 3 0 0 1 6 0M14 9h4M14 13h4",
} as const;

function Icon({ name, className = "h-5 w-5" }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

/**
 * Admin frame, phones first: a compact top bar and a bottom tab bar with the four daily sections;
 * from tablet width a fixed sidebar with everything.
 */
export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.adminOnly || user.role === "admin");
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const tabs = items.filter((i) => ["/admin", "/admin/bookings", "/admin/trips", "/admin/reviews"].includes(i.href));

  return (
    <div className="min-h-screen md:pl-60">
      {/* sidebar (tablet and desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-navy-deep text-white md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
          <span className="block">
            <Image src={media.logoOnDark.src} alt="Toubkal Peaks" width={media.logoOnDark.width} height={media.logoOnDark.height} className="h-8 w-auto" />
            <span className="mono mt-1 block text-[0.65rem] text-gold-light">ADMIN</span>
          </span>
        </Link>
        <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="Admin">
          {items.map((i) => (
            <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${active(i.href) ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
              <Icon name={i.icon} />
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
          <div className="mt-3 flex items-center justify-between">
            <a href="/" target="_blank" rel="noreferrer" className="text-xs text-gold-light hover:underline">View website ↗</a>
            <form action={logout}><button className="text-xs text-white/70 hover:text-white">Sign out</button></form>
          </div>
        </div>
      </aside>

      {/* top bar (phones) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src={media.logo.src} alt="Toubkal Peaks" width={media.logo.width} height={media.logo.height} className="h-7 w-auto" />
          <span className="mono text-[0.65rem] text-gold">ADMIN</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {items.filter((i) => !tabs.includes(i)).map((i) => (
            <Link key={i.href} href={i.href} aria-label={i.label} aria-current={active(i.href) ? "page" : undefined}
              className={active(i.href) ? "text-gold" : "text-navy"}>
              <Icon name={i.icon} />
            </Link>
          ))}
          <form action={logout}><button className="text-xs font-semibold text-muted">Sign out</button></form>
        </div>
      </header>

      <main className="pb-24 md:pb-10">{children}</main>

      {/* bottom tabs (phones) */}
      <nav aria-label="Admin" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {tabs.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i.href) ? "page" : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-semibold ${active(i.href) ? "text-gold" : "text-muted"}`}>
            <Icon name={i.icon} className="h-6 w-6" />
            {i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
