import Link from "next/link";
import { RevealSection } from "@/components/features/about/reveal-section";
import { Button } from "@/components/ui/button";

export function AboutCta(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-12">
        <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
          Taste the Tradition Tonight.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400 md:text-lg">
          Experience wood-fired pizza refined for the city. Order online or visit your nearest
          Leovorno kitchen.
        </p>
        <Button
          asChild
          className="mt-8 rounded-xl bg-[#d81b60] px-10 py-6 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-[#c2185b]"
        >
          <Link href="/">Explore the Menu</Link>
        </Button>
      </div>
    </RevealSection>
  );
}
