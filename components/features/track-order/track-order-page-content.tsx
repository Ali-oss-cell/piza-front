"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { InfoCards } from "@/components/features/content/info-cards";
import { FaqAccordion } from "@/components/motion/faq-accordion";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusStepper } from "@/components/ui/status-stepper";
import { trackOrderFaqs, trackOrderHero, trackOrderSteps } from "@/data/track-order";
import { getNextOrderUrl, ORDER_ONLINE_HREF } from "@/lib/nextorder";

const STATUS_STEPS = [
  { id: "received", label: "Received" },
  { id: "preparing", label: "Preparing" },
  { id: "out", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
];

export function TrackOrderPageContent(): React.ReactElement {
  const nextOrderUrl = getNextOrderUrl();

  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[
          { label: "Order Again", href: ORDER_ONLINE_HREF },
          { label: "Contact Store", href: "/contact", variant: "secondary" },
        ]}
        eyebrow={trackOrderHero.eyebrow}
        subtitle={trackOrderHero.subtitle}
        title={trackOrderHero.title}
      />

      <ContentSection
        description="Typical kitchen progress for delivery and pickup. Exact timing depends on your confirmation."
        title="Order status"
      >
        <Card className="p-6 md:p-8" padded={false}>
          <StatusStepper currentIndex={1} steps={STATUS_STEPS} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard highlight label="Est. ready" value="25–35 min" />
            <StatCard label="Order type" value="Pickup / Delivery" />
          </div>
        </Card>
      </ContentSection>

      <ContentSection title="How to check your order">
        <InfoCards items={trackOrderSteps} />
      </ContentSection>

      <ContentSection
        description="Most web orders are managed in NextOrder — open your confirmation or place another order below."
        title="Online orders"
      >
        <MotionReveal as="div">
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--brand-accent,#d81b60)] px-6 text-sm font-bold uppercase tracking-wide text-white hover:opacity-90"
              href={nextOrderUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Ordering Portal
            </a>
            <a
              className="inline-flex min-h-11 items-center rounded-full border border-zinc-300 px-6 text-sm font-bold uppercase tracking-wide dark:border-white/20"
              href="/contact"
            >
              Message Us
            </a>
          </div>
        </MotionReveal>
      </ContentSection>

      <ContentSection title="Common questions">
        <FaqAccordion items={trackOrderFaqs} />
      </ContentSection>

      <CtaBand
        description="Share your name, phone, and order time — we'll check with the kitchen."
        primaryHref="/contact"
        primaryLabel="Get Help"
        secondaryHref={ORDER_ONLINE_HREF}
        secondaryLabel="Browse Menu"
        title="Need a human?"
      />
    </ContentPageShell>
  );
}
