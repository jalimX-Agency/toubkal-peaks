import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { TripsTable } from "@/components/admin/TripsTable";
import { adminApi } from "@/lib/admin/api";
import type { TourRow } from "@/lib/admin/types";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Trips" };

/** Every trip in one request; searching, filtering and paging then happen in the browser. */
export default async function TripsPage() {
  const { data } = await adminApi<{ data: TourRow[] }>("/tours");
  const online = data.filter((t) => t.status === "published").length;

  return (
    <>
      <PageHeader title="Trips" subtitle={`${online} online · ${data.length} in total`} />
      <div className="p-4 md:p-8">
        <TripsTable trips={data} />
      </div>
    </>
  );
}
