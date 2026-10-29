import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { media } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-deep px-4 py-10">
      <div className="w-full max-w-sm">
        <Image src={media.logoOnDark.src} alt="Toubkal Peaks" width={media.logoOnDark.width} height={media.logoOnDark.height} className="mx-auto h-10 w-auto" priority />
        <div className="mt-8 rounded-xl bg-white p-6 shadow-xl">
          <h1 className="font-display text-2xl font-semibold text-navy">Team sign in</h1>
          <p className="mt-1 text-sm text-muted">Bookings, trips and reviews.</p>
          <Suspense>
            <Notice searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">Forgot your password? Ask an administrator to send you a new one.</p>
      </div>
    </div>
  );
}

async function Notice({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  return (
    <>
      {params.expired && <p className="mt-4 rounded-md bg-gold/10 px-3 py-2 text-sm text-gold">Your session has ended. Please sign in again.</p>}
      <LoginForm next={next} />
    </>
  );
}
