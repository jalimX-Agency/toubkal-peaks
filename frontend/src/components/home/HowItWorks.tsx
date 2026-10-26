import type { Dictionary } from "@/i18n/dictionaries/en";

/** Four plain steps from enquiry to pick-up, so a first-time visitor knows what happens after they write. */
export function HowItWorks({ dict }: { dict: Dictionary["steps"] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
      <p className="eyebrow">{dict.eyebrow}</p>
      <h2 className="heading mt-2 text-[clamp(1.6rem,3vw,2.3rem)]">{dict.title}</h2>
      <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {dict.items.map((step, i) => (
          <li key={step.title} className="relative">
            {i < dict.items.length - 1 && (
              <span aria-hidden="true" className="absolute left-14 right-0 top-6 hidden border-t border-dashed border-gold/50 lg:block" />
            )}
            <span className="font-display relative flex h-12 w-12 items-center justify-center rounded-full bg-navy text-lg font-semibold text-white">
              {i + 1}
            </span>
            <h3 className="mt-4 font-semibold text-navy">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
