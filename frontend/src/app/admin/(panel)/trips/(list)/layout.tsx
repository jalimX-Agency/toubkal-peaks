import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { TripsTable } from "@/components/admin/TripsTable";
import { adminApi } from "@/lib/admin/api";
import type { TourRow } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Trips" };

/**
 * Every trip in one request; searching, filtering and paging then happen in the browser. The list is
 * a layout: opening or closing a trip's panel (?open=, the page below) does not load it again.
 */
export default async function TripsLayout({ children }: { children: React.ReactNode }) {
  const { data } = await adminApi<{ data: TourRow[] }>("/tours");
  const online = data.filter((t) => t.status === "published").length;

  return (
    <>
      <PageHeader title="Trips" subtitle={`${online} online · ${data.length} in total`} />
      <div className="p-4 md:p-8">
        <TripsTable trips={data} />
      </div>
      {children}
    </>
  );
}
