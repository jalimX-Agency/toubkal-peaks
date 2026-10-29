"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin/actions";
import { Field, FormMessage, Submit } from "@/components/admin/form";
import type { ActionState } from "@/lib/admin/types";

export function PasswordForm() {
  const [state, action] = useActionState<ActionState, FormData>(changePassword, { status: "idle" });
  return (
    <form action={action} className="space-y-4" key={state.status === "ok" ? "done" : "form"}>
      <Field label="Current password" name="current_password" type="password" autoComplete="current-password" required state={state} />
      <Field label="New password" name="password" type="password" autoComplete="new-password" required minLength={10} state={state} hint="At least 10 characters, with letters and numbers." />
      <Field label="Repeat the new password" name="password_confirmation" type="password" autoComplete="new-password" required state={state} />
      <div className="flex items-center gap-4">
        <Submit>Change password</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
