"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { deleteBlogPost, saveBlogPost, uploadBlogCover } from "@/app/admin/actions";
import { Field, FormMessage, Select, Submit, TextArea } from "@/components/admin/form";
import type { ActionState, AdminBlogPost, AdminLocale } from "@/lib/admin/types";

const LOCALES: { code: AdminLocale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

const CATEGORY_LABELS: Record<string, string> = { toubkal: "Toubkal", atlas: "Atlas Mountains", desert: "Sahara", cities: "Imperial cities", practical: "Practical tips" };

/** Labels written inside the blocks, in the article's language. */
const WORDS: Record<AdminLocale, { short: string; tip: string; note: string; faq: string; enquire: string; trip: string }> = {
  en: { short: "In short", tip: "Our guides' tip", note: "Good to know", faq: "Frequently asked questions", enquire: "Plan my trip", trip: "See the trip →" },
  fr: { short: "En bref", tip: "Le conseil de nos guides", note: "Bon à savoir", faq: "Questions fréquentes", enquire: "Préparer mon voyage", trip: "Voir le voyage →" },
  es: { short: "En resumen", tip: "El consejo de nuestros guías", note: "Bueno saber", faq: "Preguntas frecuentes", enquire: "Preparar mi viaje", trip: "Ver el viaje →" },
  de: { short: "Kurz gesagt", tip: "Tipp unserer Guides", note: "Gut zu wissen", faq: "Häufige Fragen", enquire: "Reise planen", trip: "Zur Reise →" },
};

const prefix = (l: AdminLocale) => (l === "en" ? "" : `/${l}`);

/** Ready-made blocks of the blog vocabulary (styled by the website; anything else is removed on save). */
const BLOCKS: { label: string; html: (l: AdminLocale) => string }[] = [
  { label: "Heading", html: () => "<h2>Heading</h2>\n" },
  { label: "Paragraph", html: () => "<p>Text with a <a href=\"/toubkal-guide\">link</a>.</p>\n" },
  { label: "List", html: () => "<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>\n" },
  { label: "Answer box", html: (l) => `<div class="gx-answer"><p class="gx-label">${WORDS[l].short}</p><p><strong>The direct answer in one or two sentences.</strong> One nuance.</p></div>\n` },
  { label: "Key facts", html: () => "<ul class=\"gx-keyfacts\">\n  <li><strong>Altitude</strong>4,167 m</li>\n  <li><strong>Duration</strong>2 days</li>\n  <li><strong>Best months</strong>June to September</li>\n</ul>\n" },
  { label: "Guides' tip", html: (l) => `<div class="gx-tip"><p class="gx-label">${WORDS[l].tip}</p><p>…</p></div>\n` },
  { label: "Good to know", html: (l) => `<div class="gx-note"><p class="gx-label">${WORDS[l].note}</p><p>…</p></div>\n` },
  { label: "Table", html: () => "<div class=\"gx-table\"><table>\n  <thead><tr><th>Column</th><th>Column</th></tr></thead>\n  <tbody><tr><td>…</td><td>…</td></tr></tbody>\n</table></div>\n" },
  { label: "Month calendar", html: () => `<ul class="gx-months">${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => `<li class="is-good">${m}<small>Good</small></li>`).join("")}</ul>\n` },
  { label: "Trip cards", html: (l) => `<div class="gx-trips">\n  <a class="gx-trip" href="${prefix(l)}/treks/toubkal"><span class="gx-trip-kicker">Private trek · 2 days</span><span class="gx-trip-title">Trip name</span><span class="gx-trip-text">One sentence from the trip page.</span><span class="gx-trip-more">${WORDS[l].trip}</span></a>\n</div>\n` },
  { label: "FAQ", html: (l) => `<h2>${WORDS[l].faq}</h2>\n<div class="gx-faq"><h3>Question?</h3><p>Answer.</p><h3>Question?</h3><p>Answer.</p></div>\n` },
  { label: "Closing call to action", html: (l) => `<div class="gx-cta"><p class="gx-cta-title">Title</p><p>One sentence.</p><p class="gx-actions"><a class="gx-btn" href="${prefix(l)}/book">${WORDS[l].enquire}</a></p></div>\n` },
];

/** "2026-11-01T09:30" in the browser's time zone, as a datetime-local field expects. */
function localInput(iso: string | null) {
  const d = iso ? new Date(iso) : new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function BlogEditor({ post, categories }: { post?: AdminBlogPost; categories: string[] }) {
  const [tab, setTab] = useState<AdminLocale>("en");
  const [status, setStatus] = useState(post?.published_at ? "published" : "draft");
  const [when, setWhen] = useState(localInput(post?.published_at ?? null));
  const areas = useRef<Partial<Record<AdminLocale, HTMLTextAreaElement | null>>>({});
  const [state, action] = useActionState<ActionState, FormData>((prev, form) => saveBlogPost(post?.id ?? null, prev, form), { status: "idle" });

  const insert = (html: string) => {
    const area = areas.current[tab];
    if (!area) return;
    const { selectionStart: start, selectionEnd: end, value } = area;
    area.value = value.slice(0, start) + html + value.slice(end);
    area.focus();
    area.setSelectionRange(start + html.length, start + html.length);
  };

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Address (slug)" name="slug" required defaultValue={post?.slug} state={state} pattern="[a-z0-9]+(-[a-z0-9]+)*"
          hint="Lower case words joined by dashes, e.g. best-time-to-climb-toubkal. The same in every language. Avoid changing it once published." />
        <Select label="Topic" name="category" defaultValue={post?.category ?? ""} state={state}
          options={[{ value: "", label: "No topic" }, ...categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c }))]} />
        <Field label="Author" name="author" defaultValue={post?.author ?? ""} state={state} placeholder="Toubkal Peaks Travel" />
        <label className="flex items-center gap-3 self-end pb-2.5 text-sm font-medium text-navy">
          <input type="checkbox" name="is_featured" defaultChecked={post?.is_featured ?? false} className="h-5 w-5 accent-[var(--navy)]" />
          Featured (shown large at the top of the blog)
        </label>
      </div>

      <fieldset className="rounded-lg border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-navy">Publication</legend>
        <div className="flex flex-wrap items-end gap-4">
          {[["draft", "Draft (not on the website)"], ["published", "Published"]].map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-navy">
              <input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} className="h-4 w-4 accent-[var(--navy)]" />
              {label}
            </label>
          ))}
          {status === "published" && (
            <label className="block text-sm">
              <span className="font-medium text-navy">Date</span>
              {/* shown in the browser's time zone, which the server render cannot know */}
              <input type="datetime-local" suppressHydrationWarning value={when} onChange={(e) => setWhen(e.target.value)} className="mt-1 block rounded-md border border-line px-3 py-2" />
              <input type="hidden" suppressHydrationWarning name="published_at_iso" value={when ? new Date(when).toISOString() : ""} />
              <span className="mt-1 block text-xs text-muted">A future date keeps the article off the website until that day.</span>
            </label>
          )}
        </div>
      </fieldset>

      <Field label="Cover photo address" name="image_url" type="url" defaultValue={post?.image_url ?? ""} state={state}
        hint={post ? "Filled in when you upload a photo below, or paste an https address." : "Upload the photo after creating the article, or paste an https address."} />

      <div>
        <div role="tablist" aria-label="Language" className="flex gap-1 overflow-x-auto border-b border-line">
          {LOCALES.map((l) => (
            <button key={l.code} type="button" role="tab" aria-selected={tab === l.code} onClick={() => setTab(l.code)}
              className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold ${tab === l.code ? "border-navy text-navy" : "border-transparent text-muted"}`}>
              {l.label}{l.code === "en" && " *"}
              {post && !post.locales.includes(l.code) && l.code !== "en" && <span className="ml-1 font-normal text-muted">(not written)</span>}
            </button>
          ))}
        </div>
        {/* every language stays in the form (hidden when not selected) so one save sends them all */}
        {LOCALES.map((l) => (
          <div key={l.code} hidden={tab !== l.code} className="mt-4 grid gap-3">
            <Field label={`Title (${l.label})`} name={`title_${l.code}`} required={l.code === "en"} maxLength={160} defaultValue={post?.title[l.code] ?? ""} state={state}
              hint={l.code === "en" ? "Also the page title in search results: say what the reader will learn." : "Leave title and text empty to show the English article in this language."} />
            <TextArea label={`Summary (${l.label})`} name={`excerpt_${l.code}`} rows={2} maxLength={400} defaultValue={post?.excerpt[l.code] ?? ""} state={state}
              hint="One or two sentences, shown on the blog page and in search results." />
            <Field label={`Cover photo description (${l.label})`} name={`alt_${l.code}`} maxLength={200} defaultValue={post?.image_alt[l.code] ?? ""} state={state} />
            <div>
              <p className="text-sm font-medium text-navy">Insert a block</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {BLOCKS.map((b) => (
                  <button key={b.label} type="button" onClick={() => insert(b.html(l.code))} className="rounded-md border border-line bg-white px-2.5 py-1 text-xs font-semibold text-navy hover:border-navy">
                    + {b.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-navy">{`Text (${l.label}, HTML)`}{l.code === "en" && " *"}</span>
              <textarea ref={(el) => { areas.current[l.code] = el; }} name={`content_${l.code}`} required={l.code === "en"} rows={22} defaultValue={post?.content?.[l.code] ?? ""}
                spellCheck className="mt-1 block w-full rounded-md border border-line px-3 py-2 font-mono text-[0.82rem] leading-relaxed" />
              <span className="mt-1 block text-xs text-muted">
                Headings h2 and h3, paragraphs, lists, links, bold and the blocks above. Other tags, styles and images inside the text are removed when saving.
              </span>
              {state.status === "error" && state.errors?.[`content.${l.code}`] && <span className="mt-1 block text-xs text-sahara">{state.errors[`content.${l.code}`][0]}</span>}
            </label>
          </div>
        ))}
      </div>

      {state.status === "error" && state.errors && <p className="text-sm text-sahara">{Object.values(state.errors).flat()[0]}</p>}
      <div className="flex items-center gap-3">
        <Submit>{post ? "Save" : "Create the article"}</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function BlogCoverForm({ post }: { post: AdminBlogPost }) {
  const [state, action] = useActionState<ActionState, FormData>((prev, form) => uploadBlogCover(post.id, prev, form), { status: "idle" });
  return (
    <form action={action} className="flex flex-wrap items-end gap-4">
      <div className="relative aspect-[16/9] w-48 shrink-0 overflow-hidden rounded-md bg-sand">
        {post.image_url && <Image src={post.image_url} alt="" fill sizes="192px" unoptimized={!post.image_url.startsWith("https://cdn.toubkal-peaks.com/")} className="object-cover" />}
      </div>
      <label className="block text-sm">
        <span className="font-medium text-navy">Upload a cover photo</span>
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required className="mt-1 block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sand file:px-3 file:py-2 file:font-semibold file:text-navy" />
        <span className="mt-1 block text-xs text-muted">JPEG, PNG or WebP, landscape, at least 1,000 px wide, under 3 MB.</span>
      </label>
      <Submit pendingLabel="Uploading…">Upload</Submit>
      <FormMessage state={state} />
    </form>
  );
}

export function DeleteBlogPost({ post }: { post: AdminBlogPost }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>({ status: "idle" });
  return (
    <span className="flex items-center gap-2">
      <button type="button" disabled={pending} className="text-sm font-semibold text-sahara disabled:opacity-60"
        onClick={() => confirm(`Delete “${post.title.en}” in every language? This cannot be undone.`) && start(async () => setState(await deleteBlogPost(post.id)))}>
        Delete article
      </button>
      <FormMessage state={state} />
    </span>
  );
}
