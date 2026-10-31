"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";

/**
 * A page of the admin failed on the server (usually the API host refusing a request for a moment).
 * Instead of a blank screen: a short message, an automatic retry after a few seconds, and a button.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);
  const retry = () => {
    setRetrying(true);
    setTimeout(() => setRetrying(false), 8000);
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  useEffect(() => {
    const timer = setTimeout(retry, 2500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per error
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-line bg-white p-6 text-center">
        <p className="font-display text-xl font-semibold text-navy">This page did not load</p>
        <p className="mt-2 text-sm text-muted">The server did not answer in time. Trying again…</p>
        {error.digest && <p className="mono mt-2 text-[0.7rem] text-muted">Ref {error.digest}</p>}
        <button type="button" onClick={retry} disabled={retrying} className="mt-5 rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {retrying ? "Retrying…" : "Try again"}
        </button>
      </div>
    </div>
  );
}
