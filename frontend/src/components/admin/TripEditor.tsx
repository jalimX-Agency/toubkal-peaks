"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { saveTourContent, saveTourPrices, updateTourSettings } from "@/app/admin/actions";
import { Field, FormMessage, Select, Submit, inputClass } from "@/components/admin/form";
import { TranslationDot } from "@/components/admin/ui";
import type { ActionState, AdminLocale, ItineraryDayInput, TourContent, TourDetail } from "@/lib/admin/types";

const LOCALES: AdminLocale[] = ["en", "fr", "es", "de"];
const LANGUAGE: Record<AdminLocale, string> = { en: "English", fr: "Français", es: "Español", de: "Deutsch" };
type Tab = "settings" | "prices" | AdminLocale;

/** Trip editing: settings, price tiers and the content of each language, one tab at a time. */
export function TripEditor({ tour }: { tour: TourDetail }) {
  const [tab, setTab] = useState<Tab>("settings");
  const tabs: { value: Tab; label: React.ReactNode }[] = [
    { value: "settings", label: "Settings" },
    { value: "prices", label: "Prices" },
    ...LOCALES.map((l) => ({ value: l as Tab, label: <span className="flex items-center gap-1.5"><TranslationDot locale={l} status={tour.translations[l]?.translation_status ?? null} /><span className="hidden sm:inline">{LANGUAGE[l]}</span></span> })),
  ];

  return (
    <div className="p-4 md:p-8">
      <div role="tablist" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 md:mx-0 md:px-0">
        {tabs.map((t) => (
          <button key={t.value} role="tab" aria-selected={tab === t.value} onClick={() => setTab(t.value)}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${tab === t.value ? "border-gold text-navy" : "border-transparent text-muted hover:text-navy"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-5">
        {tab === "settings" && <Settings tour={tour} />}
        {tab === "prices" && <Prices tour={tour} />}
        {LOCALES.map((l) => tab === l && <ContentEditor key={l} tour={tour} locale={l} />)}
      </div>
    </div>
  );
}

function Settings({ tour }: { tour: TourDetail }) {
  const [state, action] = useActionState<ActionState, FormData>(updateTourSettings.bind(null, tour.id), { status: "idle" });
  return (
    <form action={action} className="grid max-w-3xl gap-4 rounded-lg border border-line bg-white p-4 sm:grid-cols-2 md:p-6">
      <Select label="Visibility" name="status" defaultValue={tour.status} state={state}
        options={[{ value: "published", label: "Online" }, { value: "draft", label: "Draft (hidden)" }, { value: "archived", label: "Archived" }]} />
      <Select label="Difficulty" name="difficulty" defaultValue={tour.difficulty ?? ""} state={state}
        options={[{ value: "", label: "—" }, { value: "easy", label: "Easy" }, { value: "moderate", label: "Moderate" }, { value: "challenging", label: "Challenging" }, { value: "difficult", label: "Difficult" }]} />
      <Field label="Days" name="duration_days" type="number" min={1} max={60} defaultValue={tour.duration_days ?? ""} state={state} />
      <Field label="Nights" name="duration_nights" type="number" min={0} max={60} defaultValue={tour.duration_nights ?? ""} state={state} />
      <Field label="Highest altitude (m)" name="max_altitude_m" type="number" min={0} max={9000} defaultValue={tour.max_altitude_m ?? ""} state={state} />
      <Field label="Order in lists" name="sort_order" type="number" min={0} defaultValue={tour.sort_order} state={state} hint="Smaller numbers come first." />
      <Field label="Group minimum" name="group_min" type="number" min={1} max={60} defaultValue={tour.group_min ?? ""} state={state} />
      <Field label="Group maximum" name="group_max" type="number" min={1} max={60} defaultValue={tour.group_max ?? ""} state={state} />
      <Select label="Price" name="price_mode" defaultValue={tour.price_mode} state={state}
        options={[{ value: "tiers", label: "Price per person by group size" }, { value: "on_request", label: "On request (no price shown)" }]} />
      <Select label="Currency" name="currency" defaultValue={tour.currency} state={state}
        options={["EUR", "USD", "GBP", "MAD"].map((c) => ({ value: c, label: c }))} />
      <label className="flex items-center gap-3 text-sm font-medium text-navy sm:col-span-2">
        <input type="checkbox" name="is_featured" defaultChecked={tour.is_featured} className="h-5 w-5 accent-[var(--navy)]" />
        Featured on the home page
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Submit>Save settings</Submit>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

type Tier = { min_pax: string; max_pax: string; price_per_person: string };

function Prices({ tour }: { tour: TourDetail }) {
  const [rows, setRows] = useState<Tier[]>(() =>
    tour.prices.length
      ? tour.prices.map((p) => ({ min_pax: String(p.min_pax), max_pax: p.max_pax === null ? "" : String(p.max_pax), price_per_person: p.price_per_person === null ? "" : String(p.price_per_person) }))
      : [{ min_pax: "1", max_pax: "", price_per_person: "" }],
  );
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();
  const update = (i: number, key: keyof Tier, value: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value } : row)));

  const save = () =>
    start(async () => {
      setState(await saveTourPrices(tour.id, rows.filter((r) => r.min_pax).map((r) => ({
        min_pax: Number(r.min_pax),
        max_pax: r.max_pax === "" ? null : Number(r.max_pax),
        price_per_person: r.price_per_person === "" ? null : Number(r.price_per_person),
      }))));
    });

  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-line bg-white p-4 md:p-6">
      {tour.price_mode === "on_request" && <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-navy">This trip shows “price on request”. Switch the price setting to show these tiers on the website.</p>}
      <p className="text-sm text-muted">
        Price per person in {tour.currency}, by group size. Leave “to” empty for “and more”, and the price empty when the group size is not possible.
        {tour.price_reviewed_at ? ` Last checked ${new Date(tour.price_reviewed_at).toLocaleDateString("en-GB")}.` : " These prices come from the old website and have not been checked yet."}
      </p>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <span>From (people)</span><span>To</span><span>Price / person</span><span className="w-9" />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2">
            <input aria-label="From" type="number" min={1} max={60} value={r.min_pax} onChange={(e) => update(i, "min_pax", e.target.value)} className={`${inputClass} !mt-0`} />
            <input aria-label="To" type="number" min={1} max={60} value={r.max_pax} placeholder="+" onChange={(e) => update(i, "max_pax", e.target.value)} className={`${inputClass} !mt-0`} />
            <input aria-label="Price per person" type="number" min={0} step="1" value={r.price_per_person} onChange={(e) => update(i, "price_per_person", e.target.value)} className={`${inputClass} !mt-0`} />
            <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} aria-label="Remove this tier" className="h-[42px] w-9 rounded-md text-lg text-sahara hover:bg-sahara/10">×</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((r) => [...r, { min_pax: String(Number(r.at(-1)?.max_pax || r.at(-1)?.min_pax || 0) + 1), max_pax: "", price_per_person: "" }])}
        className="text-sm font-semibold text-gold hover:underline">+ Add a tier</button>
      <div className="flex items-center gap-3 border-t border-line pt-4">
        <button type="button" onClick={save} disabled={pending} className="rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save prices"}</button>
        <FormMessage state={state} />
      </div>
    </div>
  );
}

// ---- content of one language ------------------------------------------------

const lines = (list: string[] | null | undefined) => (list ?? []).join("\n");
const toList = (text: string) => text.split("\n").map((s) => s.trim()).filter(Boolean);
const paragraphs = (body: string[] | null | undefined) => (body ?? []).filter((p) => p.trim()).join("\n\n");
const toParagraphs = (text: string) => text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
const entries = (obj: Record<string, string> | [] | null | undefined) => (obj && !Array.isArray(obj) ? Object.entries(obj) : []);

type DayDraft = { day: string; title: string; accommodation: string; stats: [string, string][]; body: string };
type Draft = {
  title: string; slug: string; summary: string; seo_title: string; seo_description: string;
  highlights: string; included: string; excluded: string; upgrades: string;
  facts: [string, string][]; itinerary: DayDraft[]; packing: { group: string; items: string }[];
};

function toDraft(c: TourContent): Draft {
  return {
    title: c.title ?? "", slug: c.slug ?? "", summary: c.summary ?? "", seo_title: c.seo_title ?? "", seo_description: c.seo_description ?? "",
    highlights: lines(c.highlights), included: lines(c.included), excluded: lines(c.excluded), upgrades: lines(c.upgrades),
    facts: entries(c.facts),
    itinerary: (c.itinerary ?? []).map((d: ItineraryDayInput) => ({ day: String(d.day), title: d.title ?? "", accommodation: d.accommodation ?? "", stats: entries(d.stats), body: paragraphs(d.body) })),
    packing: (c.packing ?? []).map((g) => ({ group: g.group, items: lines(g.items) })),
  };
}

function fromDraft(d: Draft): Omit<TourContent, "translation_status" | "updated_at"> {
  const pairs = (list: [string, string][]) => Object.fromEntries(list.filter(([k, v]) => k.trim() && v.trim()).map(([k, v]) => [k.trim(), v.trim()]));
  return {
    title: d.title.trim(), slug: d.slug.trim(), summary: d.summary.trim() || null,
    seo_title: d.seo_title.trim() || null, seo_description: d.seo_description.trim() || null,
    highlights: toList(d.highlights), included: toList(d.included), excluded: toList(d.excluded), upgrades: toList(d.upgrades),
    facts: pairs(d.facts),
    itinerary: d.itinerary.map((x, i) => ({ day: Number(x.day) || i + 1, title: x.title.trim(), accommodation: x.accommodation.trim() || null, stats: pairs(x.stats), body: toParagraphs(x.body) })),
    packing: d.packing.filter((g) => g.group.trim()).map((g) => ({ group: g.group.trim(), items: toList(g.items) })),
  };
}

function ContentEditor({ tour, locale }: { tour: TourDetail; locale: AdminLocale }) {
  const existing = tour.translations[locale];
  const source = tour.translations.en;
  const isSource = locale === "en";
  const [draft, setDraft] = useState<Draft>(() => toDraft(existing ?? source ?? ({} as TourContent)));
  const [reviewed, setReviewed] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<ActionState>({ status: "idle" });
  const [pending, start] = useTransition();

  // do not lose unsaved work by closing the tab
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft((d) => ({ ...d, [key]: value })); setDirty(true); };
  const errors = state.status === "error" ? state.errors ?? {} : {};
  const fieldError = (name: string) => errors[name]?.[0];
  const hasNestedErrors = Object.keys(errors).some((k) => k.includes("."));

  const save = () =>
    start(async () => {
      const result = await saveTourContent(tour.id, locale, { ...fromDraft(draft), translation_status: isSource ? "source" : reviewed ? "reviewed" : "machine" });
      setState(result);
      if (result.status === "ok") setDirty(false);
    });

  return (
    <div className="max-w-4xl space-y-5 pb-24">
      {!existing && <p className="rounded-md bg-sahara/10 px-3 py-2 text-sm text-sahara">No {LANGUAGE[locale]} version yet: the English text is shown as a starting point. Translate it, then save.</p>}
      {existing?.translation_status === "machine" && <p className="rounded-md bg-gold/10 px-3 py-2 text-sm text-navy">This is a machine translation. Read it, correct what is needed, and save it as reviewed.</p>}

      <Section title="Main">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Title" value={draft.title} onChange={(v) => set("title", v)} error={fieldError("title")} className="sm:col-span-2" />
          <TextInput label="Address (slug)" value={draft.slug} onChange={(v) => set("slug", v.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} error={fieldError("slug")}
            hint={existing && draft.slug !== existing.slug ? "The old address will redirect to the new one automatically." : tour.paths[locale] ?? undefined} className="sm:col-span-2" />
          <Area label="Summary" value={draft.summary} onChange={(v) => set("summary", v)} rows={5} className="sm:col-span-2" error={fieldError("summary")} />
        </div>
      </Section>

      <Section title="Highlights" hint="One per line.">
        <Area label="Highlights" hideLabel value={draft.highlights} onChange={(v) => set("highlights", v)} rows={6} />
      </Section>

      <Section title="Key facts" hint="Shown at the top of the trip page (best season, departure, grade…). Keep the English keys.">
        <Pairs pairs={draft.facts} onChange={(v) => set("facts", v)} keyPlaceholder="best_time" valuePlaceholder="April – October" />
      </Section>

      <Section title={`Itinerary (${draft.itinerary.length} days)`}>
        <Itinerary days={draft.itinerary} onChange={(v) => set("itinerary", v)} />
      </Section>

      <Section title="Included / not included" hint="One per line.">
        <div className="grid gap-4 md:grid-cols-2">
          <Area label="Included" value={draft.included} onChange={(v) => set("included", v)} rows={8} />
          <Area label="Not included" value={draft.excluded} onChange={(v) => set("excluded", v)} rows={8} />
        </div>
      </Section>

      <Section title="Upgrades" hint="Optional extras, one per line.">
        <Area label="Upgrades" hideLabel value={draft.upgrades} onChange={(v) => set("upgrades", v)} rows={4} />
      </Section>

      <Section title="What to bring">
        <Packing groups={draft.packing} onChange={(v) => set("packing", v)} />
      </Section>

      <Section title="Search engines" hint="Leave empty to use the title and summary.">
        <div className="grid gap-4">
          <TextInput label={`SEO title (${draft.seo_title.length}/60)`} value={draft.seo_title} onChange={(v) => set("seo_title", v)} error={fieldError("seo_title")} />
          <Area label={`SEO description (${draft.seo_description.length}/160)`} value={draft.seo_description} onChange={(v) => set("seo_description", v)} rows={3} error={fieldError("seo_description")} />
        </div>
      </Section>

      {/* save bar: always reachable, above the phone tab bar */}
      <div className="fixed inset-x-0 bottom-[3.9rem] z-20 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-60">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          {!isSource && (
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="h-4 w-4 accent-[var(--navy)]" />
              Checked by a person
            </label>
          )}
          <button type="button" onClick={save} disabled={pending} className="rounded-md bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {pending ? "Saving…" : `Save ${LANGUAGE[locale]}`}
          </button>
          {dirty && state.status !== "error" && <span className="text-xs text-muted">Unsaved changes</span>}
          <FormMessage state={hasNestedErrors && state.status === "error" ? { ...state, message: `${state.message} Check the itinerary and lists.` } : state} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-white p-4 md:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-navy">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TextInput({ label, value, onChange, error, hint, className = "" }: { label: string; value: string; onChange: (v: string) => void; error?: string; hint?: string; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium text-navy">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={Boolean(error)} className={inputClass} />
      {error ? <span className="mt-1 block text-xs text-sahara">{error}</span> : hint ? <span className="mono mt-1 block text-[0.7rem] text-muted">{hint}</span> : null}
    </label>
  );
}

function Area({ label, value, onChange, rows = 4, error, className = "", hideLabel }: { label: string; value: string; onChange: (v: string) => void; rows?: number; error?: string; className?: string; hideLabel?: boolean }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className={hideLabel ? "sr-only" : "font-medium text-navy"}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} aria-invalid={Boolean(error)} className={`${inputClass} ${hideLabel ? "!mt-0" : ""}`} />
      {error && <span className="mt-1 block text-xs text-sahara">{error}</span>}
    </label>
  );
}

function Pairs({ pairs, onChange, keyPlaceholder, valuePlaceholder }: { pairs: [string, string][]; onChange: (v: [string, string][]) => void; keyPlaceholder: string; valuePlaceholder: string }) {
  const update = (i: number, side: 0 | 1, value: string) => onChange(pairs.map((p, j) => (j === i ? (side === 0 ? [value, p[1]] : [p[0], value]) : p)));
  return (
    <div className="space-y-2">
      {pairs.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
          <input aria-label="Key" value={k} placeholder={keyPlaceholder} onChange={(e) => update(i, 0, e.target.value)} className={`${inputClass} !mt-0 font-mono !text-xs`} />
          <input aria-label="Value" value={v} placeholder={valuePlaceholder} onChange={(e) => update(i, 1, e.target.value)} className={`${inputClass} !mt-0`} />
          <button type="button" onClick={() => onChange(pairs.filter((_, j) => j !== i))} aria-label="Remove" className="w-9 rounded-md text-lg text-sahara hover:bg-sahara/10">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...pairs, ["", ""]])} className="text-sm font-semibold text-gold hover:underline">+ Add</button>
    </div>
  );
}

function Itinerary({ days, onChange }: { days: DayDraft[]; onChange: (v: DayDraft[]) => void }) {
  const [open, setOpen] = useState<number | null>(days.length ? 0 : null);
  const update = (i: number, patch: Partial<DayDraft>) => onChange(days.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= days.length) return;
    const copy = [...days];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
    setOpen(j);
  };

  return (
    <div className="space-y-2">
      {days.map((d, i) => (
        <div key={i} className="rounded-md border border-line">
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
            <span className="font-display flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs text-white">{d.day || i + 1}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">{d.title || "Untitled day"}</span>
            <span aria-hidden="true" className="text-gold">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="space-y-3 border-t border-line p-3">
              <div className="grid grid-cols-[5rem_1fr] gap-3">
                <TextInput label="Day" value={d.day} onChange={(v) => update(i, { day: v.replace(/\D/g, "") })} />
                <TextInput label="Title" value={d.title} onChange={(v) => update(i, { title: v })} />
              </div>
              <TextInput label="Accommodation" value={d.accommodation} onChange={(v) => update(i, { accommodation: v })} />
              <div>
                <p className="text-sm font-medium text-navy">Figures <span className="font-normal text-muted">(distance, elevation_gain, walking_time…)</span></p>
                <div className="mt-1"><Pairs pairs={d.stats} onChange={(v) => update(i, { stats: v })} keyPlaceholder="distance" valuePlaceholder="12 km" /></div>
              </div>
              <Area label="Description (leave an empty line between paragraphs)" value={d.body} onChange={(v) => update(i, { body: v })} rows={8} />
              <div className="flex flex-wrap gap-3 text-sm">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="font-semibold text-navy disabled:opacity-30">↑ Move up</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === days.length - 1} className="font-semibold text-navy disabled:opacity-30">↓ Move down</button>
                <button type="button" onClick={() => { onChange(days.filter((_, j) => j !== i)); setOpen(null); }} className="ml-auto font-semibold text-sahara">Remove this day</button>
              </div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => { onChange([...days, { day: String(days.length + 1), title: "", accommodation: "", stats: [], body: "" }]); setOpen(days.length); }}
        className="text-sm font-semibold text-gold hover:underline">+ Add a day</button>
    </div>
  );
}

function Packing({ groups, onChange }: { groups: { group: string; items: string }[]; onChange: (v: { group: string; items: string }[]) => void }) {
  const update = (i: number, patch: Partial<{ group: string; items: string }>) => onChange(groups.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <div className="space-y-3">
      {groups.map((g, i) => (
        <div key={i} className="space-y-2 rounded-md border border-line p-3">
          <div className="flex items-end gap-2">
            <TextInput label="Group" value={g.group} onChange={(v) => update(i, { group: v })} className="flex-1" />
            <button type="button" onClick={() => onChange(groups.filter((_, j) => j !== i))} className="pb-2.5 text-sm font-semibold text-sahara">Remove</button>
          </div>
          <Area label="Items (one per line)" value={g.items} onChange={(v) => update(i, { items: v })} rows={6} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...groups, { group: "", items: "" }])} className="text-sm font-semibold text-gold hover:underline">+ Add a group</button>
    </div>
  );
}

