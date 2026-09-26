"use client";

import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { MotionReveal } from "@/components/motion/motion-reveal";
import type { LegalSection } from "@/data/legal";

interface LegalPageContentProps {
  hero: { eyebrow: string; title: string; subtitle: string };
  sections: LegalSection[];
}

export function LegalPageContent({ hero, sections }: LegalPageContentProps): React.ReactElement {
  return (
    <ContentPageShell>
      <section className="border-b border-zinc-200/70 bg-zinc-50/50 px-4 py-16 dark:border-white/[0.08] dark:bg-zinc-950 md:px-8 md:py-20 lg:px-12">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--brand-accent,#d81b60)] md:text-xs">
            {hero.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {hero.title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[17px] md:leading-[1.6]">
            {hero.subtitle}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[720px] px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <nav aria-label="On this page" className="mb-10 hidden border-b border-zinc-200/70 pb-6 dark:border-white/[0.08] lg:block">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
            On this page
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {sections.map((section) => (
              <li key={section.title}>
                <a
                  className="text-sm text-zinc-600 hover:text-[color:var(--brand-accent,#d81b60)] dark:text-zinc-400"
                  href={`#${section.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {sections.map((section, index) => (
          <MotionReveal
            as="article"
            className="mb-12 scroll-mt-28 last:mb-0"
            delay={index * 0.05}
            id={section.title.toLowerCase().replace(/\s+/g, "-")}
            key={section.title}
          >
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white md:text-2xl">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-[17px] md:leading-[1.6]">
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
