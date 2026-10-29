"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteReview, saveReview, setReviewStatus } from "@/app/admin/actions";
import { Field, FormMessage, Select, Submit, TextArea } from "@/components/admin/form";
import type { ActionState, AdminReview } from "@/lib/admin/types";

const SOURCES = ["tripadvisor", "google", "viator", "getyourguide", "facebook", "trustpilot", "website", "other"];

export function ReviewActions({ review, tours }: { review: AdminReview; tours: { id: number; title: string }[] }) {
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<ActionState>) => start(async () => setState(await fn()));

  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {review.status !== "published" && (
          <button disabled={pending} onClick={() => run(() => setReviewStatus(review.id, "published"))} className="rounded-md bg-atlas px-3 py-1.5 font-semibold text-white disabled:opacity-60">Publish</button>
        )}
        {review.status !== "hidden" && (
          <button disabled={pending} onClick={() => run(() => setReviewStatus(review.id, "hidden"))} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-60">Hide</button>
        )}
        <button onClick={() => setEditing((e) => !e)} className="px-2 py-1.5 font-semibold text-navy">{editing ? "Close" : "Edit"}</button>
        <button disabled={pending} onClick={() => confirm(`Delete the review by ${review.author_name}? This cannot be undone.`) && run(() => deleteReview(review.id))}
          className="ml-auto px-2 py-1.5 font-semibold text-sahara disabled:opacity-60">Delete</button>
        <FormMessage state={state} />
      </div>
      {editing && <div className="mt-3"><ReviewForm review={review} tours={tours} onSaved={() => setEditing(false)} /></div>}
    </div>
  );
}

export function ReviewForm({ review, tours, onSaved }: { review?: AdminReview; tours: { id: number; title: string }[]; onSaved?: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await saveReview(review?.id ?? null, prev, form);
    if (result.status === "ok") onSaved?.();
    return result;
  }, { status: "idle" });

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2" key={!review && state.status === "ok" ? "reset" : "form"}>
      <Field label="Author" name="author_name" required defaultValue={review?.author_name} state={state} />
      <Field label="Country" name="author_country" defaultValue={review?.author_country ?? ""} state={state} />
      <Select label="Platform" name="source" defaultValue={review?.source ?? "tripadvisor"} state={state} options={SOURCES.map((s) => ({ value: s, label: s }))} />
      <Select label="Rating" name="rating" defaultValue={String(review?.rating ?? 5)} state={state} options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) }))} />
      <Field label="Title" name="title" defaultValue={review?.title ?? ""} state={state} className="sm:col-span-2" />
      <TextArea label="Review" name="body" required rows={5} defaultValue={review?.body} state={state} className="sm:col-span-2" />
      <Field label="Date" name="reviewed_at" type="date" defaultValue={review?.reviewed_at ?? ""} state={state} />
      <Select label="Language" name="language" defaultValue={review?.language ?? "en"} state={state}
        options={[["en", "English"], ["fr", "French"], ["es", "Spanish"], ["de", "German"], ["it", "Italian"], ["nl", "Dutch"], ["ar", "Arabic"]].map(([value, label]) => ({ value, label }))} />
      <Select label="Trip (optional)" name="tour_id" defaultValue={review?.tour_id ? String(review.tour_id) : ""} state={state} className="sm:col-span-2"
        options={[{ value: "", label: "— General review —" }, ...tours.map((t) => ({ value: String(t.id), label: t.title }))]} />
      <Field label="Link to the original" name="url" type="url" defaultValue={review?.url ?? ""} state={state} className="sm:col-span-2" />
      <Select label="Status" name="status" defaultValue={review?.status ?? "published"} state={state}
        options={[{ value: "published", label: "Published" }, { value: "pending", label: "To approve" }, { value: "hidden", label: "Hidden" }]} />
      <label className="flex items-center gap-3 self-end pb-2.5 text-sm font-medium text-navy">
        <input type="checkbox" name="is_featured" defaultChecked={review?.is_featured} className="h-5 w-5 accent-[var(--navy)]" />
        Featured on the home page
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Submit>{review ? "Save review" : "Add review"}</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
