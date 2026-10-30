import type { Metadata } from "next";
import { PersonCard, PersonForm } from "@/components/admin/PeopleForms";
import { Empty, PageHeader } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";
import type { AdminTeamMember } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Team page" };

export default async function PeoplePage() {
  const { data: people } = await adminApi<{ data: AdminTeamMember[] }>("/team-members");
  const ids = people.map((p) => p.id);

  return (
    <>
      <PageHeader title="Team page" subtitle="The people on the website's About page, in this order. The first one is shown large." />
      <div className="space-y-4 p-4 md:p-8">
        <details className="rounded-lg border border-line bg-white">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-gold [&::-webkit-details-marker]:hidden">+ Add a person</summary>
          <div className="border-t border-line p-4">
            <PersonForm />
            <p className="mt-3 text-xs text-muted">Add the photo after saving, with “Edit”.</p>
          </div>
        </details>
        {people.length === 0 ? <Empty>Nobody on the team page yet.</Empty> : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {people.map((p, i) => <PersonCard key={p.id} person={p} index={i} ids={ids} />)}
          </ul>
        )}
      </div>
    </>
  );
}
