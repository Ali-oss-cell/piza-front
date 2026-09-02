import Link from "next/link";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { RevealSection } from "@/components/features/about/reveal-section";
import { Button } from "@/components/ui/button";

export function AboutCta(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-12">
        <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
          Bold Flavours Tonight.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400 md:text-lg">
          Experience bold flavours and fresh bites. Order online or pick up from Wantirna South.
        </p>
        <Button
          asChild
          className="mt-8 rounded-xl bg-[color:var(--brand-accent,#d81b60)] px-10 py-6 text-sm font-semibold uppercase tracking-[0.2em] hover:brightness-110"
        >
          <Link href={ORDER_ONLINE_HREF}>Explore the Menu</Link>
        </Button>
      </div>
    </RevealSection>
  );
}
