"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { Button } from "@/components/ui/button";
import { bulkMenuItems } from "@/data/catering";
import { useCart } from "@/lib/cart-context";
import {
  bulkEligibleForInstantCheckout,
  bulkLineTotal,
  bulkToMenuItem,
} from "@/lib/catering-utils";
import type { BulkMenuItem, CateringFlow, DietaryTag } from "@/types/catering";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<BulkMenuItem["category"], string> = {
  pizzas: "Pizza Multipacks",
  pasta: "Pasta Trays",
  sides: "Sides & Drinks",
  salads: "Salads",
};

interface CateringBulkMenuProps {
  flow: CateringFlow;
  onRequestQuote: () => void;
}

export function CateringBulkMenu({
  flow,
  onRequestQuote,
}: CateringBulkMenuProps): React.ReactElement {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(bulkMenuItems.map((item) => [item.id, item.minQty]))
  );
  const { addToCart } = useCart();
  const router = useRouter();

  const categories = useMemo(() => {
    const groups = new Map<BulkMenuItem["category"], BulkMenuItem[]>();
    for (const item of bulkMenuItems) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return groups;
  }, []);

  const adjustQty = (id: string, delta: number, min: number, max: number): void => {
    setQuantities((current) => ({
      ...current,
      [id]: Math.min(max, Math.max(min, (current[id] ?? min) + delta)),
    }));
  };

  const handleAddBulk = (item: (typeof bulkMenuItems)[0]): void => {
    const qty = quantities[item.id] ?? item.minQty;
    const total = bulkLineTotal(item, qty);

    if (flow === "quote" || !bulkEligibleForInstantCheckout(item, qty)) {
      onRequestQuote();
      return;
    }

    addToCart({ item: bulkToMenuItem(item, qty), price: total, quantity: 1 });
    router.push("/cart");
  };

  return (
    <MotionReveal as="section" className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
          À La Carte Bulk Menu
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white">
          Build your own spread
        </h2>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Mix and match trays and multipacks. Totals under $500 checkout online — larger orders go
          through our quote form.
        </p>
      </div>

      {[...categories.entries()].map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {CATEGORY_LABELS[category]}
          </h3>
          <StaggerGrid className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const qty = quantities[item.id] ?? item.minQty;
              const total = bulkLineTotal(item, qty);
              const perUnit = item.unitPrice;
              const instantOk = bulkEligibleForInstantCheckout(item, qty);

              return (
                <article
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white dark:border-white/10 dark:bg-zinc-900/50"
                  key={item.id}
                >
                  <div className="relative aspect-[16/9] w-full bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      alt={item.imageAlt}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      src={item.imageUrl}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-zinc-950 dark:text-white">{item.name}</h4>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                          {item.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          ${total.toFixed(0)}
                        </p>
                        <p className="text-xs text-zinc-500">${perUnit.toFixed(0)} each</p>
                      </div>
                    </div>

                    {item.dietaryTags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.dietaryTags.map((tag) => (
                          <DietaryPill key={tag} tag={tag} />
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Decrease ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
                          onClick={() => adjustQty(item.id, -1, item.minQty, item.maxQty)}
                          type="button"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center font-bold">{qty}</span>
                        <button
                          aria-label={`Increase ${item.name}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
                          onClick={() => adjustQty(item.id, 1, item.minQty, item.maxQty)}
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <Button
                        className={cn(
                          "rounded-xl",
                          instantOk && flow === "instant"
                            ? "bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
                            : ""
                        )}
                        onClick={() => handleAddBulk(item)}
                        variant={instantOk && flow === "instant" ? "default" : "outline"}
                      >
                        {instantOk && flow === "instant" ? "Add to Cart" : "Get Quote"}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </StaggerGrid>
        </div>
      ))}
    </MotionReveal>
  );
}

function DietaryPill({ tag }: { tag: DietaryTag }): React.ReactElement {
  return (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
      {tag}
    </span>
  );
}
