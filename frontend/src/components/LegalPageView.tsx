import type { LegalPage } from "@/content/legal";
import { media, site } from "@/lib/site";

const address = `${site.address.street}, ${site.address.region}, ${site.address.postalCode} ${site.address.city}`;
const registration = site.registration.map((r) => `${r.label} ${r.value}`).join(" · ");

/** Plain, readable legal page: title band, then numbered sections. */
export function LegalPageView({ page }: { page: LegalPage }) {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.14]" style={{ backgroundImage: `url(${media.topo})` }} />
        <div className="mx-auto max-w-3xl px-4 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
          <h1 className="font-display text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-tight">{page.title}</h1>
          <p className="mono mt-4 text-white/55">{page.updated}</p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 md:px-8 md:py-16">
        {page.sections.map((section, i) => (
          <section key={section.heading}>
            <h2 className="heading flex items-baseline gap-3 text-xl">
              <span className="mono text-gold">{String(i + 1).padStart(2, "0")}</span>
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 leading-relaxed text-ink">
              {section.body.map((p) => (
                <p key={p}>{p.replace("{registration}", registration).replace("{address}", address)}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
