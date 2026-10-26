import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Four reassurances as figures, read like a map legend instead of an icon row.
 * The first one, the summit, is given more room on purpose.
 */
export function TrustStrip({ dict, tripCount }: { dict: Dictionary["trust"]; tripCount: number }) {
  const items = [
    { value: "4167", unit: "m", text: dict.summit },
    { value: "24", unit: "h", text: dict.reply },
    { value: "1–12", unit: "", text: dict.group },
    ...(tripCount > 0 ? [{ value: String(tripCount), unit: "", text: dict.trips }] : []),
  ];

  return (
    <section aria-label={dict.title} className="border-b border-line bg-sand/70">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 px-4 md:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        {items.map((item, i) => (
          <li
            key={item.text}
            className={`flex flex-col gap-2 border-line py-7 lg:border-l lg:px-7 lg:first:border-l-0 lg:first:pl-0 ${
              i === 0 ? "col-span-2 border-b lg:col-span-1 lg:border-b-0" : i % 2 === 1 ? "pr-4" : "border-l pl-4"
            }`}
          >
            <span className="mono text-gold">{String(i + 1).padStart(2, "0")}</span>
            <span className={`font-display font-semibold leading-none text-navy ${i === 0 ? "text-[clamp(2.6rem,5vw,3.6rem)]" : "text-[clamp(1.9rem,3.4vw,2.5rem)]"}`}>
              {item.value}
              {item.unit && <span className="mono ml-1.5 align-top text-[0.8rem] text-gold">{item.unit}</span>}
            </span>
            <span className={`text-sm leading-snug text-muted ${i === 0 ? "max-w-xs" : ""}`}>{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
