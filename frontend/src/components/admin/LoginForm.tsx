"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { Field, FormMessage, Submit } from "@/components/admin/form";
import type { ActionState } from "@/lib/admin/types";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionState, FormData>(login, { status: "idle" });
  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="username" required autoFocus />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <FormMessage state={state} />
      <Submit className="w-full !py-3" pendingLabel="Signing in…">Sign in</Submit>
    </form>
  );
}
