import { craftPillars } from "@/data/about";
import { RevealSection } from "@/components/features/about/reveal-section";

export function AboutPillars(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-12">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
            The Craftsmanship
          </p>
          <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-4xl">
            What Makes Leovorno Exceptional
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {craftPillars.map((pillar, index) => {
            const Icon = pillar.icon;

            return (
              <article
                className="rounded-2xl border border-zinc-200/60 bg-white/70 p-8 backdrop-blur-md transition-all duration-150 ease-out hover:border-[#d81b60]/30 dark:border-white/10 dark:bg-zinc-900/40"
                key={pillar.id}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#d81b60]/30 bg-[#d81b60]/10">
                  <Icon className="h-6 w-6 text-[#d81b60]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </RevealSection>
  );
}
