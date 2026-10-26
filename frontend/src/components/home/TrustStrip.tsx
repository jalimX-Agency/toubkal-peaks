import type { Dictionary } from "@/i18n/dictionaries/en";

const ICONS = [
  // private & tailor-made: compass
  <path key="0" d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z" />,
  // local guides: mountain
  <path key="1" d="M3 19 9.5 8l3.5 6 2-3 6 8H3Zm6.5-11 1.8 3" />,
  // travellers: people
  <path key="2" d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m1-9a2.5 2.5 0 1 0 0-5m2 14a5 5 0 0 0-3.5-4.8" />,
  // base in Imlil: house
  <path key="3" d="M4 11 12 4l8 7v9h-5v-5H9v5H4v-9Z" />,
];

/** Four reassurances right under the hero, the answers people look for before they enquire. */
export function TrustStrip({ dict }: { dict: Dictionary["trust"] }) {
  return (
    <section className="border-b border-line bg-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-6 px-4 py-8 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {dict.items.map((item, i) => (
          <li key={item.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky text-navy">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
                {ICONS[i]}
              </svg>
            </span>
            <div>
              <p className="font-semibold text-navy">{item.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
