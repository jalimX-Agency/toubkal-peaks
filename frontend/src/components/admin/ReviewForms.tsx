"use client";

import { useActionState, useState } from "react";
import { deleteReview, saveReview, setReviewStatus } from "@/app/admin/actions";
import { useFeedback } from "@/components/admin/Feedback";
import { Field, FormMessage, Select, Submit, TextArea } from "@/components/admin/form";
import { StatusBadge, day } from "@/components/admin/ui";
import type { ActionState, AdminReview } from "@/lib/admin/types";

const SOURCES = ["tripadvisor", "google", "viator", "getyourguide", "facebook", "trustpilot", "website", "other"];

function Stars({ rating }: { rating: number }) {
  return <span className="text-gold" aria-label={`${rating} out of 5`}>{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

/**
 * One review of the list. Publishing, hiding and deleting show their result at once; the server
 * works in the background and, if it refuses, the review goes back with a message.
 */
export function ReviewItem({ review, tours }: { review: AdminReview; tours: { id: number; title: string }[] }) {
  const { confirm, optimistic } = useFeedback();
  const [editing, setEditing] = useState(false);
  const [override, setOverride] = useState<AdminReview["status"] | null>(null);
  const [gone, setGone] = useState(false);
  const status = override ?? review.status;

  if (gone) return null;

  const change = async (to: "published" | "hidden") => {
    await optimistic({
      apply: () => setOverride(to),
      undo: () => setOverride(null),
      send: () => setReviewStatus(review.id, to),
      success: to === "published" ? "Review published." : "Review hidden.",
    });
    setOverride(null);
  };

  const remove = async () => {
    if (!(await confirm({ title: `Delete the review by ${review.author_name}?`, message: "This cannot be undone.", confirmLabel: "Delete review", danger: true }))) return;
    await optimistic({ apply: () => setGone(true), undo: () => setGone(false), send: () => deleteReview(review.id), success: "Review deleted." });
  };

  return (
    <li className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-navy">{review.author_name}{review.author_country && <span className="font-normal text-muted"> · {review.author_country}</span>}</p>
          <p className="mono text-[0.7rem] text-muted">
            <Stars rating={review.rating} /> · {review.source} · {day(review.reviewed_at ?? review.created_at)}
            {review.tour_title && <> · {review.tour_title}</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {review.is_featured && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white">Featured</span>}
          <StatusBadge status={status} kind="review" />
        </div>
      </div>
      {review.title && <p className="mt-2 font-semibold text-ink">{review.title}</p>}
      <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm text-ink">{review.body}</p>
      <div className="mt-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {status !== "published" && <button onClick={() => change("published")} className="rounded-md bg-atlas px-3 py-1.5 font-semibold text-white">Publish</button>}
          {status !== "hidden" && <button onClick={() => change("hidden")} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy">Hide</button>}
          <button onClick={() => setEditing((e) => !e)} className="px-2 py-1.5 font-semibold text-navy">{editing ? "Close" : "Edit"}</button>
          <button onClick={remove} className="ml-auto px-2 py-1.5 font-semibold text-sahara">Delete</button>
        </div>
        {editing && <div className="mt-3"><ReviewForm review={review} tours={tours} onSaved={() => setEditing(false)} /></div>}
      </div>
    </li>
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
