"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { galleryHero, galleryImages } from "@/data/gallery";

export function GalleryPageContent(): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: "Order Now", href: "/menu" }]}
        eyebrow={galleryHero.eyebrow}
        subtitle={galleryHero.subtitle}
        title={galleryHero.title}
      />
      <ContentSection>
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image) => (
            <figure
              className="group overflow-hidden rounded-2xl border border-zinc-200/70 dark:border-white/10"
              key={image.src}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={image.alt}
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                src={image.src}
              />
              {image.caption ? (
                <figcaption className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </StaggerGrid>
      </ContentSection>
      <CtaBand
        description="See something you like? It's on the menu."
        primaryHref="/menu"
        primaryLabel="Browse Menu"
        title="Hungry yet?"
      />
    </ContentPageShell>
  );
}
