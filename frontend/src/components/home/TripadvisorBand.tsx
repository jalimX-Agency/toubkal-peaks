import { ICONS } from "@/components/SocialLinks";
import { Arrow } from "@/components/ui/Arrow";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { site } from "@/lib/site";

/** The company's Tripadvisor rating and a link to read the reviews there (the reviews themselves stay on Tripadvisor). */
export function TripadvisorBand({ lang, dict }: { lang: Locale; dict: Dictionary["reviews"]["tripadvisor"] }) {
  const url = site.social.tripadvisor;
  if (!url) return null;
  const { score, count } = site.tripadvisorRating;
  const number = (n: number, digits = 0) => new Intl.NumberFormat(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

  return (
    <section aria-label="Tripadvisor" className="border-y border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-5 px-4 py-8 md:px-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#34e0a1] text-black">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden="true">
              <path d={ICONS.tripadvisor} />
            </svg>
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-navy">{dict.title.replace("{score}", number(score, 1))}</p>
            <p className="mt-0.5 text-sm text-muted">{dict.text.replace("{count}", number(count))}</p>
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline-navy">
          {dict.cta}
          <Arrow />
        </a>
      </div>
    </section>
  );
}
