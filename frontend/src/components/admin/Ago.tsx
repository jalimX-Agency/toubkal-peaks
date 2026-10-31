"use client";

import { useSyncExternalStore } from "react";
import { ago, day } from "@/components/admin/ui";

const noSubscription = () => () => {};

/** "3 h ago", worked out in the browser: the server shows the date, so no clock is read while rendering. */
export function Ago({ iso }: { iso: string | null | undefined }) {
  const text = useSyncExternalStore(noSubscription, () => ago(iso), () => day(iso));
  return <time dateTime={iso ?? undefined}>{text}</time>;
}
