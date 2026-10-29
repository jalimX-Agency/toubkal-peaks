"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { BookingWizard as Wizard } from "@/components/book/BookingWizard";

/**
 * The wizard only renders in the browser: it restores a draft from sessionStorage and reads ?trip=
 * from the URL, neither of which exists on the server. The page header stays server-rendered.
 */
const BookingWizard = dynamic(() => import("@/components/book/BookingWizard").then((m) => m.BookingWizard), {
  ssr: false,
  loading: () => <div className="mx-auto min-h-[60vh] max-w-6xl px-4 md:px-8" />,
});

export function BookingWizardLoader(props: ComponentProps<typeof Wizard>) {
  return <BookingWizard {...props} />;
}
