"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { deletePerson, orderPeople, savePerson, setPersonVisible, uploadPersonPhoto } from "@/app/admin/actions";
import { useFeedback } from "@/components/admin/Feedback";
import { Field, FormMessage, Submit, TextArea } from "@/components/admin/form";
import type { ActionState, AdminLocale, AdminTeamMember } from "@/lib/admin/types";

const LOCALES: { code: AdminLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

/** The people of the page, in their order. Moving, hiding and deleting show at once; the server follows. */
export function PeopleList({ people }: { people: AdminTeamMember[] }) {
  const { optimistic } = useFeedback();
  const [local, setLocal] = useState<{ for: AdminTeamMember[]; ids: number[] } | null>(null);
  const ids = local && local.for === people ? local.ids : people.map((p) => p.id);
  const byId = new Map(people.map((p) => [p.id, p]));

  const order = (next: number[]) =>
    optimistic({
      apply: () => setLocal({ for: people, ids: next }),
      undo: () => setLocal(null),
      send: () => orderPeople(next),
    });

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {ids.map((id, i) => {
        const person = byId.get(id);
        return person ? <PersonCard key={id} person={person} index={i} ids={ids} onOrder={order} /> : null;
      })}
    </ul>
  );
}

/** One card per person: photo, name, role, visibility, order buttons; "Edit" opens the full form. */
function PersonCard({ person, index, ids, onOrder }: { person: AdminTeamMember; index: number; ids: number[]; onOrder: (next: number[]) => void }) {
  const { confirm, optimistic } = useFeedback();
  const [editing, setEditing] = useState(false);
  const [shown, setShown] = useState<boolean | null>(null);
  const [gone, setGone] = useState(false);
  const active = shown ?? person.is_active;
  const move = (by: number) => {
    const next = [...ids];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    onOrder(next);
  };
  const toggle = async () => {
    const to = !active;
    await optimistic({
      apply: () => setShown(to),
      undo: () => setShown(null),
      send: () => setPersonVisible(person.id, to),
      success: to ? `${person.name} is shown on the website.` : `${person.name} is hidden.`,
    });
    setShown(null);
  };
  const remove = async () => {
    if (!(await confirm({ title: `Remove ${person.name} from the team page?`, message: "This cannot be undone.", confirmLabel: "Remove", danger: true }))) return;
    await optimistic({ apply: () => setGone(true), undo: () => setGone(false), send: () => deletePerson(person.id), success: `${person.name} removed.` });
  };

  if (gone) return null;

  return (
    <li className={`rounded-lg border border-line bg-white p-4 ${active ? "" : "opacity-70"}`}>
      <div className="flex gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
          {person.photo && <Image src={person.photo.url} alt="" fill sizes="80px" className="object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy">
            {person.name}
            {!active && <span className="ml-2 rounded-full bg-muted/15 px-2 py-0.5 text-xs font-semibold text-muted">Hidden</span>}
          </p>
          <p className="text-sm text-muted">{person.role.en}</p>
          <p className="mono mt-1 text-[0.7rem] text-muted">
            {LOCALES.map((l) => ((person.bio[l.code]?.length ?? 0) > 0 ? l.code.toUpperCase() : `${l.code.toUpperCase()} (English shown)`)).join(" · ")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
        <button disabled={index === 0} onClick={() => move(-1)} aria-label={`Move ${person.name} up`} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-40">↑</button>
        <button disabled={index === ids.length - 1} onClick={() => move(1)} aria-label={`Move ${person.name} down`} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy disabled:opacity-40">↓</button>
        <button onClick={toggle} className="rounded-md border border-line px-3 py-1.5 font-semibold text-navy">
          {active ? "Hide" : "Show"}
        </button>
        <button onClick={() => setEditing((e) => !e)} className="px-2 py-1.5 font-semibold text-navy">{editing ? "Close" : "Edit"}</button>
        <button onClick={remove} className="ml-auto px-2 py-1.5 font-semibold text-sahara">Delete</button>
      </div>
      {editing && (
        <div className="mt-4 space-y-6 border-t border-line pt-4">
          <PhotoForm person={person} />
          <PersonForm person={person} onSaved={() => setEditing(false)} />
        </div>
      )}
    </li>
  );
}

function PhotoForm({ person }: { person: AdminTeamMember }) {
  const [state, action] = useActionState<ActionState, FormData>((prev, form) => uploadPersonPhoto(person.id, prev, form), { status: "idle" });
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="block text-sm">
        <span className="font-medium text-navy">New photo</span>
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required className="mt-1 block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sand file:px-3 file:py-2 file:font-semibold file:text-navy" />
        <span className="mt-1 block text-xs text-muted">JPEG, PNG or WebP, at least 400 px, up to 2 MB. A portrait (taller than wide) looks best.</span>
      </label>
      <Submit pendingLabel="Uploading…">Upload</Submit>
      <FormMessage state={state} />
    </form>
  );
}

/** Name, visibility, and per language: role, biography (paragraphs separated by an empty line), photo description. */
export function PersonForm({ person, onSaved }: { person?: AdminTeamMember; onSaved?: () => void }) {
  const [tab, setTab] = useState<AdminLocale>("en");
  const [state, action] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await savePerson(person?.id ?? null, prev, form);
    if (result.status === "ok") onSaved?.();
    return result;
  }, { status: "idle" });

  return (
    <form action={action} className="space-y-4" key={!person && state.status === "ok" ? "reset" : "form"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name as shown" name="name" required defaultValue={person?.name} state={state} hint="Full name for the owner, first name for the others." />
        <label className="flex items-center gap-3 self-end pb-2.5 text-sm font-medium text-navy">
          <input type="checkbox" name="is_active" defaultChecked={person?.is_active ?? true} className="h-5 w-5 accent-[var(--navy)]" />
          Shown on the website
        </label>
      </div>

      <div role="tablist" aria-label="Language" className="flex gap-1 overflow-x-auto border-b border-line">
        {LOCALES.map((l) => (
          <button key={l.code} type="button" role="tab" aria-selected={tab === l.code} onClick={() => setTab(l.code)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${tab === l.code ? "border-navy text-navy" : "border-transparent text-muted"}`}>
            {l.label}{l.code === "en" && " *"}
          </button>
        ))}
      </div>
      {/* every language stays in the form (hidden when not selected) so one save sends them all */}
      {LOCALES.map((l) => (
        <div key={l.code} hidden={tab !== l.code} className="grid gap-3">
          <Field label={`Role (${l.label})`} name={`role_${l.code}`} required={l.code === "en"} defaultValue={person?.role[l.code] ?? ""} state={state}
            hint={l.code === "en" ? undefined : "Leave empty to show the English text."} />
          <TextArea label={`Biography (${l.label})`} name={`bio_${l.code}`} required={l.code === "en"} rows={10} defaultValue={(person?.bio[l.code] ?? []).join("\n\n")} state={state}
            hint="Separate paragraphs with an empty line." />
          <Field label={`Photo description (${l.label})`} name={`alt_${l.code}`} defaultValue={person?.photo_alt[l.code] ?? ""} state={state}
            hint="What the photo shows, for search engines and screen readers." />
        </div>
      ))}
      {state.status === "error" && state.errors && (
        <p className="text-xs text-sahara">{Object.values(state.errors).flat()[0]}</p>
      )}
      <div className="flex items-center gap-3">
        <Submit>{person ? "Save" : "Add to the team page"}</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
