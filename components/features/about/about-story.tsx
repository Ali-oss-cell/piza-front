import Image from "next/image";
import { aboutStory } from "@/data/about";
import { RevealSection } from "@/components/features/about/reveal-section";

function highlightText(text: string, phrases: string[]): React.ReactNode {
  const pattern = new RegExp(`(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    phrases.includes(part) ? (
      <span className="text-[#d81b60]" key={`${part}-${index}`}>
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

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#d81b60]">
            Our Story
          </p>
          <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-4xl">
            Crafted for the Modern Epicurean
          </h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-300 md:text-lg">
            {aboutStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{highlightText(paragraph, aboutStory.highlightPhrases)}</p>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
