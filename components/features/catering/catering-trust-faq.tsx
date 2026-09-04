"use client";

import { Building2, Clock, ShieldCheck, Star } from "lucide-react";
import { FaqAccordion } from "@/components/motion/faq-accordion";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { cateringPolicies } from "@/data/catering";

export function CateringTrustFaq(): React.ReactElement {
  return (
    <MotionReveal as="section" className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
          Trusted by local teams
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white">
          Events we cater every week
        </h2>
        <StaggerGrid className="mt-8 grid gap-4 sm:grid-cols-2">
          <TrustCard
            icon={Building2}
            text="Office lunches & Friday team feeds"
            title="Corporate"
          />
          <TrustCard icon={Star} text="Birthdays, graduations & family celebrations" title="Private parties" />
          <TrustCard icon={ShieldCheck} text="Sports clubs, schools & community groups" title="Community" />
          <TrustCard icon={Clock} text="24–48 hour lead time, reliable delivery windows" title="On schedule" />
        </StaggerGrid>
        <p className="mt-6 text-sm italic text-zinc-500 dark:text-zinc-400">
          &ldquo;Generous portions, familiar favourites — exactly what you need when feeding a
          crowd.&rdquo;
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Catering FAQ</h3>
        <FaqAccordion
          className="mt-6"
          items={cateringPolicies.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))}
        />
      </div>
    </MotionReveal>
  );
}

function TrustCard({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/30">
      <Icon className="h-5 w-5 text-[color:var(--brand-accent,#d81b60)]" />
      <p className="mt-3 font-semibold text-zinc-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
    </div>
  );
}
