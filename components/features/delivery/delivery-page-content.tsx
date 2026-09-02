"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { InfoCards } from "@/components/features/content/info-cards";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { deliveryHero, deliveryNotes, deliveryOptions, deliveryZones } from "@/data/delivery";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";

export function DeliveryPageContent(): React.ReactElement {
  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[
          { label: "Order Delivery", href: ORDER_ONLINE_HREF },
          { label: "FAQ", href: "/faq", variant: "secondary" },
        ]}
        eyebrow={deliveryHero.eyebrow}
        subtitle={deliveryHero.subtitle}
        title={deliveryHero.title}
      />
      <ContentSection title="How it works">
        <InfoCards items={deliveryOptions} />
      </ContentSection>
      <ContentSection description="Enter your address at checkout to confirm delivery availability." title="Delivery areas">
        <MotionReveal as="div">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {deliveryZones.map((zone) => (
              <li
                className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 px-4 py-3 text-zinc-700 dark:border-white/10 dark:bg-zinc-900/30 dark:text-zinc-300"
                key={zone}
              >
                {zone}
              </li>
            ))}
          </ul>
        </MotionReveal>
      </ContentSection>
      <ContentSection title="Good to know">
        <ul className="space-y-3 text-zinc-600 dark:text-zinc-400">
          {deliveryNotes.map((note) => (
            <li className="flex gap-3" key={note}>
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-accent,#d81b60)]" />
              {note}
            </li>
          ))}
        </ul>
      </ContentSection>
      <CtaBand
        description="Browse the menu and choose delivery or pickup at checkout."
        primaryHref={ORDER_ONLINE_HREF}
        primaryLabel="Start Order"
        secondaryHref="/contact"
        secondaryLabel="Ask a Question"
        title="Ready when you are"
      />
    </ContentPageShell>
  );
}
