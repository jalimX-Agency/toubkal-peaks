"use client";

import { useActionState, useState, useTransition } from "react";
import { inviteMember, updateMember } from "@/app/admin/actions";
import { Field, FormMessage, Select, Submit } from "@/components/admin/form";
import type { ActionState, AdminUser } from "@/lib/admin/types";

export function InviteForm() {
  const [state, action] = useActionState<ActionState, FormData>(inviteMember, { status: "idle" });
  return (
    <form action={action} className="space-y-3" key={state.status === "ok" ? "sent" : "form"}>
      <Field label="Name" name="name" required state={state} />
      <Field label="Email" name="email" type="email" required state={state} />
      <Select label="Role" name="role" defaultValue="staff" state={state}
        options={[{ value: "staff", label: "Team member: bookings, trips and reviews" }, { value: "admin", label: "Administrator: also manages accounts" }]} />
      <p className="text-xs text-muted">They receive an email with a temporary password, to change at first sign-in.</p>
      <div className="flex items-center gap-3">
        <Submit pendingLabel="Sending…">Send invitation</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function MemberActions({ member }: { member: AdminUser }) {
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();
  const run = (changes: Parameters<typeof updateMember>[1], question?: string) => {
    if (question && !confirm(question)) return;
    start(async () => setState(await updateMember(member.id, changes)));
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
      <button disabled={pending} onClick={() => run({ role: member.role === "admin" ? "staff" : "admin" })} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-60">
        {member.role === "admin" ? "Make team member" : "Make administrator"}
      </button>
      {member.is_active && (
        <button disabled={pending} onClick={() => run({ reset_password: true }, `Email a new temporary password to ${member.email}?`)} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-60">
          Send new password
        </button>
      )}
      <button disabled={pending} onClick={() => run({ is_active: !member.is_active }, member.is_active ? `Disable ${member.name}? They are signed out at once.` : undefined)}
        className={`ml-auto px-2 py-1.5 font-semibold disabled:opacity-60 ${member.is_active ? "text-sahara" : "text-atlas"}`}>
        {member.is_active ? "Disable" : "Enable"}
      </button>
      <FormMessage state={state} />
    </div>
  );
}
