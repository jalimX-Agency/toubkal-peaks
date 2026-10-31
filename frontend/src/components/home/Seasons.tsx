import type { Dictionary } from "@/i18n/dictionaries/en";

type Level = "best" | "good" | "hard";

/** How good each month is, January to December (from the guides' experience of each season). */
const CALENDAR: Record<"atlas" | "sahara", Level[]> = {
  atlas: ["hard", "hard", "good", "best", "best", "best", "good", "good", "best", "best", "good", "hard"],
  sahara: ["good", "good", "best", "best", "good", "hard", "hard", "hard", "good", "best", "best", "good"],
};

const STYLE: Record<Level, string> = {
  best: "bg-atlas text-white",
  good: "bg-gold/25 text-navy",
  hard: "bg-sand text-muted",
};

/** When to go: a month-by-month calendar for the mountains and for the desert. */
export function Seasons({ dict }: { dict: Dictionary["seasons"] }) {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
          <p className="mt-4 leading-relaxed text-muted">{dict.lead}</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {(["atlas", "sahara"] as const).map((kind) => (
            <div key={kind} className="rounded-sm border border-line bg-white p-5 md:p-6">
              <h3 className="font-semibold text-navy">{dict[kind]}</h3>
              <ol className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-12">
                {CALENDAR[kind].map((level, i) => (
                  <li key={i} className={`flex flex-col items-center rounded-sm px-1 py-2 text-[0.7rem] font-semibold ${STYLE[level]}`}>
                    <span>{dict.months[i]}</span>
                    <span className="sr-only">: {dict.legend[level]}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-muted">{dict.notes[kind]}</p>
            </div>
          ))}
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-hidden="true">
          {(["best", "good", "hard"] as const).map((level) => (
            <li key={level} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-sm ${STYLE[level]}`} />
              {dict.legend[level]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
