import Image from "next/image";
import { aboutHero } from "@/data/about";

export function AboutHero(): React.ReactElement {
  return (
    <section className="relative min-h-[78vh] overflow-hidden">
      <Image
        alt={aboutHero.imageAlt}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={aboutHero.imageUrl}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/30 transition-colors duration-150 ease-out dark:from-black dark:via-black/80 dark:to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40 transition-colors duration-150 ease-out dark:from-black dark:via-transparent dark:to-black/40" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-4 pb-20 pt-32 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
            {aboutHero.eyebrow}
          </p>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-6xl lg:text-7xl">
            {aboutHero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-300 md:text-xl">
            {aboutHero.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
