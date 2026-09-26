/**
 * Scaffold only — not wired into /reviews yet.
 *
 * To enable live Google reviews:
 * 1. Confirm placeholder quotes in `data/reviews.ts` can be removed / replaced
 * 2. Set env: GOOGLE_PLACES_API_KEY (server) + store Google Place ID in settings
 * 3. Call `fetchGooglePlaceReviews(placeId)` from the reviews page server component
 * 4. Render `<GoogleReviewsList reviews={...} />` instead of static `reviews`
 *
 * Requires Places API (New) or Places Details with `reviews` field.
 */

export interface GooglePlaceReview {
  authorName: string;
  authorUrl?: string | null;
  profilePhotoUrl?: string | null;
  rating: number;
  relativeTimeDescription?: string | null;
  text: string;
  time?: number | null;
}

export interface GooglePlaceReviewsResult {
  placeId: string;
  rating: number | null;
  userRatingsTotal: number | null;
  reviews: GooglePlaceReview[];
  fetchedAt: string;
}

/**
 * Server-only helper. Returns null when API key / place ID missing or request fails.
 * Do not call from client components (exposes key risk if misconfigured).
 */
export async function fetchGooglePlaceReviews(
  placeId: string | null | undefined,
  options?: { apiKey?: string; language?: string; maxReviews?: number }
): Promise<GooglePlaceReviewsResult | null> {
  const id = placeId?.trim();
  const apiKey =
    options?.apiKey?.trim() ||
    process.env.GOOGLE_PLACES_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!id || !apiKey) {
    return null;
  }

  const maxReviews = Math.min(options?.maxReviews ?? 5, 5);
  const language = options?.language ?? "en";
  const fields = "name,rating,user_ratings_total,reviews";
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", id);
  url.searchParams.set("fields", fields);
  url.searchParams.set("language", language);
  url.searchParams.set("reviews_sort", "most_relevant");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as {
      status?: string;
      result?: {
        rating?: number;
        user_ratings_total?: number;
        reviews?: Array<{
          author_name?: string;
          author_url?: string;
          profile_photo_url?: string;
          rating?: number;
          relative_time_description?: string;
          text?: string;
          time?: number;
        }>;
      };
    };

    if (payload.status !== "OK" || !payload.result) {
      return null;
    }

    const reviews = (payload.result.reviews ?? [])
      .filter((review) => Boolean(review.text?.trim()))
      .slice(0, maxReviews)
      .map((review) => ({
        authorName: review.author_name?.trim() || "Google user",
        authorUrl: review.author_url ?? null,
        profilePhotoUrl: review.profile_photo_url ?? null,
        rating: typeof review.rating === "number" ? review.rating : 0,
        relativeTimeDescription: review.relative_time_description ?? null,
        text: review.text?.trim() || "",
        time: review.time ?? null,
      }));

    return {
      placeId: id,
      rating: payload.result.rating ?? null,
      userRatingsTotal: payload.result.user_ratings_total ?? null,
      reviews,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
