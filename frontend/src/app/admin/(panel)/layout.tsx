import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminApi } from "@/lib/admin/api";
import type { AdminUser } from "@/lib/admin/types";

/** Signed-in area: the navigation shell, then each page streams in below it. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { user } = await adminApi<{ user: AdminUser }>("/auth/me");
  // A temporary password must be replaced before anything else (path forwarded by proxy.ts).
  const path = (await headers()).get("x-admin-path") ?? "";
  if (user.must_change_password && !path.startsWith("/admin/account")) redirect("/admin/account?first=1");

  return (
    <AdminShell user={user}>
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </AdminShell>
  );
}

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4 md:p-8" aria-hidden="true">
      <div className="h-8 w-48 rounded bg-sand" />
      <div className="h-24 rounded bg-white" />
      <div className="h-64 rounded bg-white" />
    </div>
  );
}
