"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import type { MarketingPageContent } from "@/data/marketing";

interface MarketingPageContentProps {
  content: MarketingPageContent;
}

export function MarketingPageContentView({
  content,
}: MarketingPageContentProps): React.ReactElement {
  const isNutrition = content.eyebrow.toLowerCase().includes("nutrition");
  const isLoyalty = content.title.toLowerCase().includes("loyalty");

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

      {isNutrition ? (
        <ContentSection title="At a glance">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Menu prices" value="GST in" />
            <StatCard highlight label="Large serves" value="2–3" />
            <StatCard label="Extras" value="In cart" />
          </div>
        </ContentSection>
      ) : null}

      {isLoyalty ? (
        <ContentSection title="Your rewards">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard highlight label="Points balance" value="—" />
            <StatCard label="Member tier" value="Join free" />
          </div>
        </ContentSection>
      ) : null}

      {content.sections.map((section, index) => (
        <ContentSection key={section.title} title={section.title}>
          <MotionReveal as="div" delay={index * 0.05}>
            <Card className="p-6 md:p-8" padded={false}>
              <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[17px] md:leading-[1.6]">
                {section.body}
              </p>
            </Card>
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
