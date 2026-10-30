"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { describeTripPhoto, searchPhotoLibrary, setTripPhotos, uploadTripPhoto } from "@/app/admin/actions";
import { Field, FormMessage, Submit, inputClass } from "@/components/admin/form";
import type { ActionState, AdminLocale, TourDetail, TripImage } from "@/lib/admin/types";

const LOCALES: { code: AdminLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];
const MAX_BYTES = 2 * 1024 * 1024;
const RECOMMENDED = 6;

/**
 * A trip's photos: the first is the main photo (cards, page top, sharing), the others form the gallery.
 * Every change is saved at once. New photos upload one by one; photos of other trips can be reused
 * from the library.
 */
export function TripPhotos({ tour }: { tour: TourDetail }) {
  const images = tour.images;
  const ids = images.map((i) => i.id);
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();
  const [describing, setDescribing] = useState<number | null>(null);
  const [library, setLibrary] = useState(false);
  const run = (next: number[]) => start(async () => setState(await setTripPhotos(tour.id, next)));
  const move = (index: number, to: number) => {
    const next = [...ids];
    const [id] = next.splice(index, 1);
    next.splice(to, 0, id);
    run(next);
  };

  return (
    <div className="max-w-5xl space-y-4">
      <div className="rounded-lg border border-line bg-white p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">Photos ({images.length})</h2>
            <p className="mt-1 text-sm text-muted">
              The first photo is the main one (trip cards, top of the page). At least {RECOMMENDED} photos are recommended.
            </p>
          </div>
          <FormMessage state={state} />
        </div>
        {images.length < RECOMMENDED && (
          <p className="mt-3 rounded-md bg-gold/10 px-3 py-2 text-sm text-gold">This trip has fewer than {RECOMMENDED} photos.</p>
        )}

        <ul className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
          {images.map((img, i) => (
            <li key={img.id} className={`overflow-hidden rounded-md border bg-white ${i === 0 ? "border-gold ring-1 ring-gold" : "border-line"}`}>
              <div className="relative aspect-[4/3] bg-sand">
                <Image src={img.url} alt={img.alt.en ?? ""} fill sizes="(min-width: 1024px) 240px, 45vw" className="object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-white">Main photo</span>}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 min-h-[2.5em] text-xs text-ink">{img.alt.en || <span className="text-sahara">No description</span>}</p>
                <div className="mt-2 flex flex-wrap gap-1 text-xs">
                  <button disabled={pending || i === 0} onClick={() => move(i, i - 1)} aria-label="Move earlier" className="rounded border border-line px-2 py-1 font-semibold text-navy disabled:opacity-40">←</button>
                  <button disabled={pending || i === images.length - 1} onClick={() => move(i, i + 1)} aria-label="Move later" className="rounded border border-line px-2 py-1 font-semibold text-navy disabled:opacity-40">→</button>
                  {i !== 0 && <button disabled={pending} onClick={() => move(i, 0)} className="rounded border border-line px-2 py-1 font-semibold text-navy disabled:opacity-40">Make main</button>}
                  <button onClick={() => setDescribing(describing === img.id ? null : img.id)} className="rounded border border-line px-2 py-1 font-semibold text-navy">Describe</button>
                  <button disabled={pending} onClick={() => confirm("Remove this photo from the trip? It stays in the library.") && run(ids.filter((id) => id !== img.id))}
                    className="ml-auto rounded px-2 py-1 font-semibold text-sahara disabled:opacity-40">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {describing !== null && (
          <DescribeForm key={describing} tourId={tour.id} image={images.find((i) => i.id === describing)!} onDone={() => setDescribing(null)} />
        )}
      </div>

      <Uploader tourId={tour.id} />

      <div className="rounded-lg border border-line bg-white">
        <button onClick={() => setLibrary((l) => !l)} className="w-full px-4 py-3 text-left text-sm font-semibold text-gold">
          {library ? "− Close the photo library" : "+ Add photos from the library (photos of other trips)"}
        </button>
        {library && <Library current={ids} onAdd={(id) => run([...ids, id])} pending={pending} />}
      </div>
    </div>
  );
}

function DescribeForm({ tourId, image, onDone }: { tourId: number; image: TripImage; onDone: () => void }) {
  const [state, action] = useActionState<ActionState, FormData>(async (prev, form) => {
    const result = await describeTripPhoto(tourId, image.id, prev, form);
    if (result.status === "ok") onDone();
    return result;
  }, { status: "idle" });
  return (
    <form action={action} className="mt-4 grid gap-3 rounded-md border border-line bg-cream p-4 sm:grid-cols-2">
      <p className="text-sm font-semibold text-navy sm:col-span-2">What does the photo show? (for Google and screen readers)</p>
      {LOCALES.map((l) => (
        <Field key={l.code} label={l.label} name={`alt_${l.code}`} required={l.code === "en"} defaultValue={image.alt[l.code] ?? ""} state={state} maxLength={200}
          hint={l.code === "en" ? undefined : "Empty: the English text is used."} />
      ))}
      <div className="flex items-center gap-3 sm:col-span-2">
        <Submit>Save description</Submit>
        <button type="button" onClick={onDone} className="text-sm font-semibold text-muted">Cancel</button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Several files can be chosen; they are checked here (type, 2 MB) and sent one after the other. */
function Uploader({ tourId }: { tourId: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const upload = async (files: File[]) => {
    setErrors([]);
    const problems: string[] = [];
    const ok = files.filter((f) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) problems.push(`${f.name}: use JPEG, PNG or WebP.`);
      else if (f.size > MAX_BYTES) problems.push(`${f.name}: ${(f.size / 1024 / 1024).toFixed(1)} MB, the limit is 2 MB.`);
      else return true;
      return false;
    });
    setProgress({ done: 0, total: ok.length });
    for (const [i, file] of ok.entries()) {
      const form = new FormData();
      form.append("photo", file);
      const result = await uploadTripPhoto(tourId, form);
      if (result.status === "error") problems.push(`${file.name}: ${result.errors?.photo?.[0] ?? result.message}`);
      setProgress({ done: i + 1, total: ok.length });
    }
    setErrors(problems);
    setProgress(null);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-4 md:p-6">
      <label className="block text-sm">
        <span className="font-semibold text-navy">Upload new photos</span>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={progress !== null}
          onChange={(e) => e.target.files && upload([...e.target.files])}
          className="mt-2 block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-4 file:py-2 file:font-semibold file:text-white" />
        <span className="mt-1 block text-xs text-muted">JPEG, PNG or WebP, at least 800 px wide, up to 2 MB each. Landscape photos work best.</span>
      </label>
      {progress && <p role="status" className="mt-3 text-sm font-medium text-navy">Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…</p>}
      {errors.length > 0 && (
        <ul role="alert" className="mt-3 space-y-1 text-sm text-sahara">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
      )}
    </div>
  );
}

function Library({ current, onAdd, pending }: { current: number[]; onAdd: (id: number) => void; pending: boolean }) {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof searchPhotoLibrary>> | null>(null);

  useEffect(() => {
    let live = true;
    searchPhotoLibrary(query, page).then((r) => live && setResult(r)).catch(() => live && setResult({ data: [], meta: { current_page: 1, last_page: 1, total: 0 } }));
    return () => {
      live = false;
    };
  }, [query, page]);

  return (
    <div className="border-t border-line p-4">
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(q); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Search: Toubkal, Merzouga, Fes…" className={`${inputClass} mt-0 flex-1`} />
        <button className="rounded-md bg-navy px-4 text-sm font-semibold text-white">Search</button>
      </form>
      {!result ? <p className="mt-4 text-sm text-muted">Loading…</p> : (
        <>
          <p className="mt-3 text-xs text-muted">{result.meta.total} photos</p>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {result.data.map((img) => {
              const added = current.includes(img.id);
              return (
                <li key={img.id}>
                  <button disabled={added || pending} onClick={() => onAdd(img.id)} title={img.alt.en} className="group relative block aspect-[4/3] w-full overflow-hidden rounded bg-sand disabled:cursor-default">
                    <Image src={img.url} alt={img.alt.en ?? ""} fill sizes="160px" className={`object-cover ${added ? "opacity-40" : "group-hover:opacity-80"}`} />
                    <span className={`absolute bottom-1 right-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${added ? "bg-atlas text-white" : "bg-white/90 text-navy"}`}>{added ? "Added" : "+ Add"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {result.meta.last_page > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="font-semibold text-navy disabled:opacity-40">‹ Previous</button>
              <span className="text-muted">{page} / {result.meta.last_page}</span>
              <button disabled={page >= result.meta.last_page} onClick={() => setPage((p) => p + 1)} className="font-semibold text-navy disabled:opacity-40">Next ›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
