import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Review, ReviewSummary } from "@/lib/types";

function Stars({ rating, className = "h-4 w-4" }: { rating: number; className?: string }) {
  return (
    <span className="flex gap-0.5 text-gold" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 20 20" className={className} fill={n <= Math.round(rating) ? "currentColor" : "none"} stroke="currentColor" aria-hidden="true">
          <path d="m10 1.8 2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8L6 11.8l-4.3-4 5.8-.7L10 1.8Z" />
        </svg>
      ))}
    </span>
  );
}

/** Travellers' reviews from every source. Renders nothing until reviews exist: no invented testimonials. */
export function Testimonials({ dict, reviews, summary }: { dict: Dictionary["reviews"]; reviews: Review[]; summary: ReviewSummary }) {
  if (reviews.length === 0) return null;

  return (
    <section className="bg-sky/60">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{dict.eyebrow}</p>
            <h2 className="heading mt-2 text-[clamp(1.6rem,3vw,2.3rem)]">{dict.title}</h2>
          </div>
          {summary.average && (
            <div className="flex items-center gap-3">
              <span className="font-display text-3xl font-semibold text-navy">{summary.average.toFixed(1)}</span>
              <div>
                <Stars rating={summary.average} />
                <p className="text-sm text-muted">{dict.based.replace("{count}", String(summary.count))}</p>
              </div>
            </div>
          )}
        </div>
        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => (
            <li key={review.id} className="flex flex-col rounded-xl bg-white p-6">
              <Stars rating={review.rating} />
              {review.title && <p className="mt-3 font-semibold text-navy">{review.title}</p>}
              <p className="mt-2 line-clamp-6 flex-1 text-sm leading-relaxed text-ink">{review.body}</p>
              <p className="mt-4 text-sm font-semibold text-navy">
                {review.author}
                {review.country && <span className="font-normal text-muted"> · {review.country}</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
