"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { InquiryForm } from "@/components/features/inquiry/inquiry-form";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { careersHero, jobOpenings } from "@/data/careers";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

interface CareersPageContentProps {
  brandSlug?: string;
}

export function CareersPageContent({
  brandSlug = DEFAULT_BRAND_SLUG,
}: CareersPageContentProps): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: "Apply Below", href: "#apply" }]}
        eyebrow={careersHero.eyebrow}
        subtitle={careersHero.subtitle}
        title={careersHero.title}
      />
      <ContentSection title="Current openings">
        <StaggerGrid className="grid gap-6 lg:grid-cols-3">
          {jobOpenings.map((job) => (
            <article
              className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30"
              key={job.id}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-accent,#d81b60)]">
                {job.type}
              </p>
              <h3 className="mt-2 text-lg font-bold">{job.title}</h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{job.description}</p>
              <ul className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                {job.requirements.map((req) => (
                  <li key={req}>• {req}</li>
                ))}
              </ul>
            </article>
          ))}
        </StaggerGrid>
      </ContentSection>
      <ContentSection
        description="Tell us which role interests you and a bit about your experience."
        id="apply"
        title="Apply now"
      >
        <div className="max-w-2xl rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30 md:p-8">
          <InquiryForm
            brandSlug={brandSlug}
            messageLabel="About you"
            messagePlaceholder="Which role are you applying for? Share your experience and availability..."
            subjectLabel="Role"
            submitLabel="Submit Application"
            type="CAREERS"
          />
        </div>
      </ContentSection>
      <CtaBand
        description="We're always keen to meet people who care about good food and great service."
        primaryHref="/contact"
        primaryLabel="General Enquiry"
        title="Don't see your role?"
      />
    </ContentPageShell>
  );
}
