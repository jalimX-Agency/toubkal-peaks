import type { Metadata } from "next";
import { InviteForm, MemberActions } from "@/components/admin/TeamForms";
import { Card, PageHeader, ago } from "@/components/admin/ui";
import { AdminApiError, adminApi } from "@/lib/admin/api";
import type { AdminUser } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const { user: me } = await adminApi<{ user: AdminUser }>("/auth/me");
  let members: AdminUser[] = [];
  try {
    members = (await adminApi<{ data: AdminUser[] }>("/users")).data;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 403) {
      return (
        <>
          <PageHeader title="Team" />
          <p className="p-4 text-muted md:p-8">Only administrators can manage team accounts.</p>
        </>
      );
    }
    throw error;
  }

  return (
    <>
      <PageHeader title="Team" subtitle="Who can sign in to the admin. Administrators also manage accounts." />
      <div className="grid gap-5 p-4 md:p-8 lg:grid-cols-12">
        <ul className="space-y-2.5 lg:col-span-7">
          {members.map((m) => (
            <li key={m.id} className={`rounded-lg border bg-white p-4 ${m.is_active ? "border-line" : "border-dashed border-line opacity-70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{m.name}{m.id === me.id && <span className="font-normal text-muted"> (you)</span>}</p>
                  <p className="truncate text-sm text-muted">{m.email}</p>
                  <p className="mono mt-1 text-[0.7rem] text-muted">
                    {m.role === "admin" ? "Administrator" : "Team member"} · {m.is_active ? (m.last_login_at ? `last sign-in ${ago(m.last_login_at)}` : "never signed in") : "disabled"}
                    {m.must_change_password && m.is_active && " · temporary password"}
                  </p>
                </div>
              </div>
              {m.id !== me.id && <MemberActions member={m} />}
            </li>
          ))}
        </ul>
        <div className="lg:col-span-5">
          <Card title="Invite someone">
            <InviteForm />
          </Card>
        </div>
      </div>
    </>
  );
}
