"use client";

import Link from "next/link";
import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { InquiryForm } from "@/components/features/inquiry/inquiry-form";
import { contactChannels, contactHero } from "@/data/contact";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

interface ContactPageContentProps {
  brandSlug?: string;
  storeName: string;
}

export function ContactPageContent({
  brandSlug = DEFAULT_BRAND_SLUG,
  storeName,
}: ContactPageContentProps): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: "Call or Visit", href: "/locations", variant: "secondary" }]}
        eyebrow={contactHero.eyebrow}
        subtitle={contactHero.subtitle}
        title={contactHero.title}
      />
      <ContentSection description={`Reach ${storeName} using the details below or send us a message.`}>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {contactChannels.map((channel) => {
            const Icon = channel.icon;
            return (
              <Link
                className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 transition-colors hover:border-[color:var(--brand-accent,#d81b60)]/40 dark:border-white/10 dark:bg-zinc-900/30"
                href={channel.href}
                key={channel.title}
              >
                <Icon className="mb-4 h-8 w-8 text-[color:var(--brand-accent,#d81b60)]" />
                <h3 className="font-bold">{channel.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{channel.detail}</p>
              </Link>
            );
          })}
        </StaggerGrid>
      </ContentSection>
      <ContentSection
        id="contact-form"
        title="Send a message"
        description="We'll get back to you within one business day."
      >
        <div className="max-w-2xl rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30 md:p-8">
          <InquiryForm
            brandSlug={brandSlug}
            messagePlaceholder="Tell us about your order, catering event, or question..."
            subjectLabel="Topic"
            type="CONTACT"
          />
        </div>
      </ContentSection>
    </ContentPageShell>
  );
}
