import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { adminApi } from "@/lib/admin/api";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { data } = await adminApi<{ data: { copy_protection: boolean } }>("/settings");
  return (
    <>
      <PageHeader title="Settings" subtitle="Options of the public website." />
      <div className="max-w-3xl space-y-4 p-4 md:p-8">
        <SettingsForm copyProtection={data.copy_protection} />
      </div>
    </>
  );
}
