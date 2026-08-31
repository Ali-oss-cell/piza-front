"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { MotionReveal } from "@/components/motion/motion-reveal";
import type { MarketingPageContent } from "@/data/marketing";

interface MarketingPageContentProps {
  content: MarketingPageContent;
}

export function MarketingPageContentView({
  content,
}: MarketingPageContentProps): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={
          content.secondaryCta
            ? [
                { label: content.primaryCta.label, href: content.primaryCta.href },
                {
                  label: content.secondaryCta.label,
                  href: content.secondaryCta.href,
                  variant: "secondary",
                },
              ]
            : [{ label: content.primaryCta.label, href: content.primaryCta.href }]
        }
        eyebrow={content.eyebrow}
        subtitle={content.subtitle}
        title={content.title}
      />
      {content.sections.map((section, index) => (
        <ContentSection key={section.title} title={section.title}>
          <MotionReveal as="div" delay={index * 0.05}>
            <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">{section.body}</p>
          </MotionReveal>
        </ContentSection>
      ))}
      <CtaBand
        description={content.ctaDescription}
        primaryHref={content.primaryCta.href}
        primaryLabel={content.primaryCta.label}
        secondaryHref={content.secondaryCta?.href}
        secondaryLabel={content.secondaryCta?.label}
        title={content.ctaTitle}
      />
    </ContentPageShell>
  );
}
