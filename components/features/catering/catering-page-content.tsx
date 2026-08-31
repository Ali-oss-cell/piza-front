"use client";

import { useCallback, useRef, useState } from "react";
import { CateringBulkMenu } from "@/components/features/catering/catering-bulk-menu";
import { CateringCalculator } from "@/components/features/catering/catering-calculator";
import { CateringHero } from "@/components/features/catering/catering-hero";
import { CateringPackages } from "@/components/features/catering/catering-packages";
import { CateringQuoteForm } from "@/components/features/catering/catering-quote-form";
import { CateringTrustFaq } from "@/components/features/catering/catering-trust-faq";
import type { CateringFlow } from "@/types/catering";
import { cn } from "@/lib/utils";

interface CateringPageContentProps {
  storeName: string;
  brandSlug: string;
}

export function CateringPageContent({
  storeName,
  brandSlug,
}: CateringPageContentProps): React.ReactElement {
  const [flow, setFlow] = useState<CateringFlow>("instant");
  const packagesRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="bg-white text-zinc-950 transition-colors duration-150 ease-out dark:bg-black dark:text-white">
      <CateringHero
        flow={flow}
        onFlowChange={setFlow}
        onInstantClick={() => scrollTo(packagesRef)}
        onQuoteClick={() => {
          setFlow("quote");
          scrollTo(quoteRef);
        }}
      />

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 md:px-8 lg:px-12 lg:py-24">
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-3 rounded-2xl border p-2",
            "border-zinc-200/70 bg-zinc-50/80 dark:border-white/10 dark:bg-zinc-900/40"
          )}
        >
          <FlowToggle active={flow === "instant"} label="Instant Checkout (under $500)" onClick={() => setFlow("instant")} />
          <FlowToggle active={flow === "quote"} label="Custom Event / Quote" onClick={() => setFlow("quote")} />
        </div>

        <CateringCalculator />

        <div ref={packagesRef}>
          <CateringPackages
            flow={flow}
            onRequestQuote={() => {
              setFlow("quote");
              scrollTo(quoteRef);
            }}
          />
        </div>

        <CateringBulkMenu
          flow={flow}
          onRequestQuote={() => {
            setFlow("quote");
            scrollTo(quoteRef);
          }}
        />

        <section
          className="scroll-mt-28 rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30 md:p-10"
          id="catering-quote"
          ref={quoteRef}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
            Custom Events
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white">
            Request a catering quote
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            For corporate accounts, events over $500, or custom menus — tell us what you need and
            we&apos;ll reply within 24 hours.
          </p>
          <div className="mt-8">
            <CateringQuoteForm brandSlug={brandSlug} storeName={storeName} />
          </div>
        </section>

        <CateringTrustFaq />
      </div>
    </main>
  );
}

function FlowToggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      className={cn(
        "rounded-xl px-5 py-3 text-sm font-semibold transition-colors",
        active
          ? "bg-[color:var(--brand-accent,#d81b60)] text-white shadow-md"
          : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
