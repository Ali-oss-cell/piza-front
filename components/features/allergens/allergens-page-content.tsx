"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { allergenHero, allergenSections, commonAllergens } from "@/data/allergens";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export function AllergensPageContent(): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: "Contact Us", href: "/contact", variant: "secondary" }]}
        eyebrow={allergenHero.eyebrow}
        subtitle={allergenHero.subtitle}
        title={allergenHero.title}
      />
      {allergenSections.map((section) => (
        <ContentSection key={section.title} title={section.title}>
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">{section.body}</p>
        </ContentSection>
      ))}
      <ContentSection title="Common allergens in our kitchen">
        <StaggerGrid className="flex flex-wrap gap-3">
          {commonAllergens.map((allergen) => (
            <span
              className="rounded-full border border-zinc-200/70 bg-zinc-50/80 px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-zinc-900/40"
              key={allergen}
            >
              {allergen}
            </span>
          ))}
        </StaggerGrid>
      </ContentSection>
      <CtaBand
        description="Speak to our team before ordering so we can advise on safe choices."
        primaryHref="/contact"
        primaryLabel="Contact Us"
        secondaryHref={ORDER_ONLINE_HREF}
        secondaryLabel="View Menu"
        title="Severe allergy?"
      />
    </ContentPageShell>
  );
}
