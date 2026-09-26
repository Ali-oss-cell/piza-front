"use client";

import Link from "next/link";
import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { InquiryForm } from "@/components/features/inquiry/inquiry-form";
import { buildContactChannels, contactHero } from "@/data/contact";
import { displayPhone, toTelHref } from "@/lib/store-contact";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

interface ContactPageContentProps {
  brandSlug?: string;
  storeName: string;
  address?: string | null;
  contactPhone?: string | null;
}

export function ContactPageContent({
  brandSlug = DEFAULT_BRAND_SLUG,
  storeName,
  address = null,
  contactPhone = null,
}: ContactPageContentProps): React.ReactElement {
  const phoneLabel = displayPhone(contactPhone);
  const phoneHref = toTelHref(contactPhone);
  const channels = buildContactChannels({
    address,
    phone: phoneLabel,
    phoneHref,
  });

  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[{ label: phoneHref ? "Call or Visit" : "Visit Us", href: "/locations", variant: "secondary" }]}
        eyebrow={contactHero.eyebrow}
        subtitle={contactHero.subtitle}
        title={contactHero.title}
      />
      <ContentSection description={`Reach ${storeName} using the details below or send us a message.`}>
        <StaggerGrid className="grid gap-6 md:grid-cols-3">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const className =
              "rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 transition-colors hover:border-[color:var(--brand-accent,#d81b60)]/40 dark:border-white/10 dark:bg-zinc-900/30";
            const body = (
              <>
                <Icon className="mb-4 h-8 w-8 text-[color:var(--brand-accent,#d81b60)]" />
                <h3 className="font-bold">{channel.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{channel.detail}</p>
              </>
            );

            if (channel.external) {
              return (
                <a className={className} href={channel.href} key={channel.title}>
                  {body}
                </a>
              );
            }

            return (
              <Link className={className} href={channel.href} key={channel.title}>
                {body}
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
