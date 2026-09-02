"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { FaqAccordion } from "@/components/motion/faq-accordion";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { faqHero, faqSections } from "@/data/faq";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export function FaqPageContent(): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[
          { label: "Contact Us", href: "/contact" },
          { label: "Order Now", href: ORDER_ONLINE_HREF, variant: "secondary" },
        ]}
        eyebrow={faqHero.eyebrow}
        subtitle={faqHero.subtitle}
        title={faqHero.title}
      />
      {faqSections.map((section) => (
        <ContentSection key={section.title} title={section.title}>
          <FaqAccordion items={section.items} />
        </ContentSection>
      ))}
      <CtaBand
        description="Our team is happy to help with orders, catering, and dietary questions."
        primaryHref="/contact"
        primaryLabel="Get in Touch"
        secondaryHref={ORDER_ONLINE_HREF}
        secondaryLabel="View Menu"
        title="Still have questions?"
      />
    </ContentPageShell>
  );
}
