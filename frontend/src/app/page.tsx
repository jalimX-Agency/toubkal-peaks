import { Suspense } from "react";
import { api } from "@/lib/api";

async function ApiStatus() {
  let status = "unreachable";
  try {
    status = (await api<{ status: string }>("/health", { cache: "no-store" }))
      .status;
  } catch {}
  return <>API status: {status}</>;
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="luxury-label text-amber">High Atlas · Morocco</p>
      <h1 className="heading-display text-5xl md:text-7xl">Toubkal Peaks</h1>
      <p className="body-editorial text-foreground/60">
        <Suspense fallback="API status: checking…">
          <ApiStatus />
        </Suspense>
      </p>
    </main>
  );
}
