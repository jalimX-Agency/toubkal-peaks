import type { Metadata } from "next";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { currentUser } from "@/lib/admin/api";

// Admin pages read the API for the signed-in member on every visit: no instant (prerendered) navigation.
export const instant = false;

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const [user, params] = await Promise.all([currentUser(), searchParams]);
  const forced = user.must_change_password;

  return (
    <>
      <PageHeader title="Your account" subtitle={`${user.name} · ${user.email} · ${user.role === "admin" ? "Administrator" : "Team member"}`} />
      <div className="max-w-xl space-y-5 p-4 md:p-8">
        {(forced || params.first) && (
          <p className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-navy">
            Welcome! Choose your own password to replace the temporary one we emailed you.
          </p>
        )}
        <Card title="Change password">
          <PasswordForm />
        </Card>
      </div>
    </>
  );
}
