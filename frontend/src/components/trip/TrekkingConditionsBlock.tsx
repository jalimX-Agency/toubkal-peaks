import { trekkingConditions } from "@/content/trekking-conditions";
import type { Locale } from "@/i18n/config";

/** The conditions text itself (headings and paragraphs), shared by the trip page and the booking request. */
export function ConditionsText({ lang }: { lang: Locale }) {
  const c = trekkingConditions[lang];
  return (
    <div className="space-y-5 text-sm leading-relaxed text-ink">
      <p>{c.intro}</p>
      {c.sections.map((s) => (
        <div key={s.heading}>
          <h3 className="font-semibold text-navy">{s.heading}</h3>
          {s.body.map((p) => <p key={p} className="mt-2">{p}</p>)}
          {s.list && (
            <ul className="mt-2 space-y-1.5">
              {s.list.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/** Shown on the Mount Toubkal trips, before the reservation section. */
export function TrekkingConditionsBlock({ lang }: { lang: Locale }) {
  return (
    <section aria-labelledby="trekking-conditions" className="border-t border-line bg-cream">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-14">
        <h2 id="trekking-conditions" className="heading text-[clamp(1.4rem,2.6vw,2rem)]">{trekkingConditions[lang].title}</h2>
        <div className="mt-5 rounded-sm border border-line border-l-4 border-l-gold bg-white p-5 md:p-7">
          <ConditionsText lang={lang} />
        </div>
      </div>
    </section>
  );
}
