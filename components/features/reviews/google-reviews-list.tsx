/**
 * Presentational scaffold for verified Google reviews.
 * Not imported by /reviews yet — wire up only after confirming Place ID + API key
 * and retiring placeholder testimonials in `data/reviews.ts`.
 */

import type { GooglePlaceReview, GooglePlaceReviewsResult } from "@/lib/google-place-reviews";

interface GoogleReviewsListProps {
  data: GooglePlaceReviewsResult;
  storeName: string;
}

function StarRow({ rating }: { rating: number }): React.ReactElement {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${clamped} out of 5 stars`} className="text-amber-500">
      {"★".repeat(clamped)}
      <span className="text-zinc-300 dark:text-zinc-600">{"★".repeat(5 - clamped)}</span>
    </span>
  );
}

function ReviewCard({ review }: { review: GooglePlaceReview }): React.ReactElement {
  return (
    <article className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          {review.authorUrl ? (
            <a
              className="font-semibold text-zinc-950 underline-offset-2 hover:underline dark:text-white"
              href={review.authorUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {review.authorName}
            </a>
          ) : (
            <p className="font-semibold text-zinc-950 dark:text-white">{review.authorName}</p>
          )}
          {review.relativeTimeDescription ? (
            <p className="text-xs text-zinc-500">{review.relativeTimeDescription}</p>
          ) : null}
        </div>
        <StarRow rating={review.rating} />
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{review.text}</p>
    </article>
  );
}

export function GoogleReviewsList({
  data,
  storeName,
}: GoogleReviewsListProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-accent,#d81b60)]">
            Google Reviews
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">
            {storeName}
          </h2>
        </div>
        {data.rating != null ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <StarRow rating={data.rating} />{" "}
            <span className="ml-1 font-medium">{data.rating.toFixed(1)}</span>
            {data.userRatingsTotal != null
              ? ` · ${data.userRatingsTotal} ratings`
              : null}
          </p>
        ) : null}
      </div>

      {data.reviews.length === 0 ? (
        <p className="text-sm text-zinc-500">No Google reviews available yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.reviews.map((review) => (
            <ReviewCard
              key={`${review.authorName}-${review.time ?? review.text.slice(0, 24)}`}
              review={review}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Reviews sourced from Google. Last refreshed{" "}
        {new Date(data.fetchedAt).toLocaleString("en-AU")}.
      </p>
    </div>
  );
}
