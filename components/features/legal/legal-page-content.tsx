"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { MotionReveal } from "@/components/motion/motion-reveal";
import type { LegalSection } from "@/data/legal";

interface LegalPageContentProps {
  hero: { eyebrow: string; title: string; subtitle: string };
  sections: LegalSection[];
}

export function LegalPageContent({ hero, sections }: LegalPageContentProps): React.ReactElement {
  return (
    <ContentPageShell>
      <section className="border-b border-zinc-200/70 bg-zinc-50/50 px-4 py-20 dark:border-white/10 dark:bg-zinc-950 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
            {hero.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
            {hero.title}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{hero.subtitle}</p>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 lg:px-12">
        {sections.map((section, index) => (
          <MotionReveal as="article" className="mb-12 last:mb-0" delay={index * 0.05} key={section.title}>
            <h2 className="text-xl font-bold">{section.title}</h2>
            <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-400">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </MotionReveal>
        ))}
      </div>
    </ContentPageShell>
  );
}
