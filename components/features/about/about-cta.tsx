import Link from "next/link";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { RevealSection } from "@/components/features/about/reveal-section";
import { Button } from "@/components/ui/button";

export function AboutCta(): React.ReactElement {
  return (
    <RevealSection className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[color:var(--brand-accent,#d81b60)]/20 bg-gradient-to-br from-[color:var(--brand-accent,#d81b60)]/8 via-transparent to-transparent px-4 py-14 text-center dark:from-[color:var(--brand-accent,#d81b60)]/15 lg:px-12">
        <h2 className="font-display text-3xl font-bold text-zinc-950 transition-colors duration-150 ease-out dark:text-white md:text-5xl">
          Bold Flavours Tonight.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400 md:text-lg">
          Experience bold flavours and fresh bites. Order online or pick up from Wantirna South.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            className="rounded-xl bg-[color:var(--brand-accent,#d81b60)] px-10 py-6 text-sm font-semibold uppercase tracking-[0.2em] hover:brightness-110"
          >
            <Link href={ORDER_ONLINE_HREF}>Order Online</Link>
          </Button>
          <Button
            asChild
            className="rounded-xl border-[color:var(--brand-accent,#d81b60)]/40 px-10 py-6 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-accent,#d81b60)] hover:bg-[color:var(--brand-accent,#d81b60)]/10"
            variant="outline"
          >
            <Link href="/locations">Find Us</Link>
          </Button>
        </div>
      </div>
    </RevealSection>
  );
}
