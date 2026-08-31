"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cateringPackages } from "@/data/catering";
import { useCart } from "@/lib/cart-context";
import { packageEligibleForInstantCheckout, packageToMenuItem } from "@/lib/catering-utils";
import type { CateringFlow } from "@/types/catering";
import type { DietaryTag } from "@/types/catering";
import { cn } from "@/lib/utils";

interface CateringPackagesProps {
  flow: CateringFlow;
  onRequestQuote: () => void;
}

export function CateringPackages({
  flow,
  onRequestQuote,
}: CateringPackagesProps): React.ReactElement {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddPackage = (pkg: (typeof cateringPackages)[0]): void => {
    if (!packageEligibleForInstantCheckout(pkg)) {
      onRequestQuote();
      return;
    }
    addToCart({ item: packageToMenuItem(pkg), price: pkg.totalPrice, quantity: 1 });
    router.push("/cart");
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
          Pre-Set Packages
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-zinc-950 dark:text-white">
          Pick a package, know your per-head cost
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {cateringPackages.map((pkg) => {
          const instant = packageEligibleForInstantCheckout(pkg);
          const showInstant = flow === "instant" && instant;
          const showQuote = flow === "quote" || !instant;

          return (
            <article
              className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/50"
              key={pkg.id}
            >
              <div className="relative aspect-[16/10]">
                <Image alt={pkg.imageAlt} className="object-cover" fill sizes="33vw" src={pkg.imageUrl} />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-950 dark:text-white">{pkg.name}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{pkg.guestRange}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      ${pkg.totalPrice}
                    </p>
                    <p className="text-sm font-medium text-[color:var(--brand-accent,#d81b60)]">
                      ${pkg.perPerson} / person
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{pkg.tagline}</p>

                <DietaryPills tags={pkg.dietaryTags} />

                <ul className="mt-4 flex-1 space-y-2">
                  {pkg.items.map((item) => (
                    <li className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400" key={item}>
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-accent,#d81b60)]" />
                      {item}
                    </li>
                  ))}
                </ul>

                {showInstant ? (
                  <Button
                    className="mt-6 w-full rounded-xl bg-[color:var(--brand-accent,#d81b60)] hover:brightness-110"
                    onClick={() => handleAddPackage(pkg)}
                  >
                    Add to Cart — Instant Checkout
                  </Button>
                ) : null}
                {showQuote ? (
                  <Button
                    className={cn("mt-3 w-full rounded-xl", showInstant && "mt-2")}
                    onClick={onRequestQuote}
                    variant={showInstant ? "outline" : "default"}
                  >
                    {instant ? "Request Custom Quote" : "Request Quote — $500+"}
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DietaryPills({ tags }: { tags: DietaryTag[] }): React.ReactElement | null {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          key={tag}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
