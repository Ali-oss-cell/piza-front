import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pizza } from "lucide-react";
import { aboutStory } from "@/data/about";
import { RevealSection } from "@/components/features/about/reveal-section";
import { Button } from "@/components/ui/button";

function highlightText(text: string, phrases: string[]): React.ReactNode {
  const pattern = new RegExp(`(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    phrases.includes(part) ? (
      <span className="text-[color:var(--brand-accent,#d81b60)]" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export function AboutStory(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:gap-16 lg:px-12">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-zinc-200/60 transition-colors duration-150 ease-out dark:border-white/10">
          <Image
            alt={aboutStory.imageAlt}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src={aboutStory.imageUrl}
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--brand-accent,#d81b60)]/20 bg-[color:var(--brand-accent,#d81b60)]/10 text-[color:var(--brand-accent,#d81b60)]">
              <Pizza className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--brand-accent,#d81b60)]">
                Our Story
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {aboutStory.locationLine}
              </p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-4xl">
            {aboutStory.heading}
          </h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-300 md:text-lg">
            {aboutStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{highlightText(paragraph, aboutStory.highlightPhrases)}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-zinc-200/70 pt-8 dark:border-white/10">
            <p className="font-display text-lg italic text-zinc-700 dark:text-zinc-300">
              — The Benny Boy&apos;s team
            </p>
            <Button
              asChild
              className="mt-6 h-11 rounded-xl border-[color:var(--brand-accent,#d81b60)] px-6 text-[color:var(--brand-accent,#d81b60)] hover:bg-[color:var(--brand-accent,#d81b60)] hover:text-white"
              variant="outline"
            >
              <Link href="/">
                Explore Our Menu
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
