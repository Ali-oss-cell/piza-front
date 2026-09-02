"use client";

import { Star } from "lucide-react";
import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { reviews, reviewsHero } from "@/data/reviews";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export function ReviewsPageContent(): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: "Leave Us a Review", href: "/contact" }]}
        eyebrow={reviewsHero.eyebrow}
        subtitle={reviewsHero.subtitle}
        title={reviewsHero.title}
      />
      <ContentSection>
        <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              className="flex h-full flex-col rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30"
              key={review.name}
            >
              <div aria-label={`${review.rating} out of 5 stars`} className="mb-4 flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    className="h-4 w-4 fill-[color:var(--brand-accent,#d81b60)] text-[color:var(--brand-accent,#d81b60)]"
                    key={i}
                  />
                ))}
              </div>
              <p className="flex-1 text-zinc-700 dark:text-zinc-300">&ldquo;{review.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-zinc-500">
                {review.name} · {review.suburb} · {review.date}
              </footer>
            </blockquote>
          ))}
        </StaggerGrid>
      </ContentSection>
      <CtaBand
        description="Join the locals who order pickup, delivery, and catering every week."
        primaryHref={ORDER_ONLINE_HREF}
        primaryLabel="Order Now"
        title="See for yourself"
      />
    </ContentPageShell>
  );
}
