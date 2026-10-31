import type { Dictionary } from "@/i18n/dictionaries/en";

/** Frequent questions as native disclosures (no script needed), with their FAQPage structured data. */
export function Faq({ dict }: { dict: Dictionary["faq"] }) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  }).replace(/</g, "\\u003c");

  return (
    <section className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{dict.eyebrow}</p>
          <h2 className="heading mt-2 text-[clamp(1.8rem,3.4vw,2.8rem)]">{dict.title}</h2>
        </div>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {dict.items.map((item, i) => (
            <details key={item.q} className="group py-1" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 font-semibold text-navy marker:hidden [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-gold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-5 pr-10 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
