"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { ComboConfiguratorModal } from "@/components/features/deals/combo-configurator-modal";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatCurrency } from "@/lib/pricing";
import { formatDealBadge } from "@/types/deals";
import type { ComboDeal } from "@/types/combo-deals";
import type { Deal } from "@/types/deals";
import type { MenuItem } from "@/types/menu";
import { pageShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface DealsPageContentProps {
  promoDeals: Deal[];
  comboDeals: ComboDeal[];
  menuItems: MenuItem[];
}

export function DealsPageContent({
  promoDeals,
  comboDeals,
  menuItems,
}: DealsPageContentProps): React.ReactElement {
  const featured = promoDeals.filter((deal) => deal.isFeatured);
  const regular = promoDeals.filter((deal) => !deal.isFeatured);
  const hasAny = comboDeals.length > 0 || promoDeals.length > 0;
  const [activeCombo, setActiveCombo] = useState<ComboDeal | null>(null);

  return (
    <main className={cn("min-h-screen pt-24", pageShell)}>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(216,27,96,0.12),_transparent_55%)]"
        />
        <div className="relative mx-auto max-w-container-max px-margin-mobile pb-16 pt-10 md:px-margin-desktop">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-accent,#d81b60)]">
              <Sparkles className="h-4 w-4" />
              Exclusive Offers
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Deals
            </h1>
            <p className={cn("mt-4 text-lg leading-relaxed", secondaryText)}>
              Build a combo at a fixed price, or use a promo code at checkout.
            </p>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-accent,#d81b60)] transition hover:gap-3"
              href="/menu"
            >
              Back to menu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {!hasAny ? (
            <div className="mt-16 rounded-3xl border border-dashed border-zinc-300/70 bg-white/70 p-12 text-center backdrop-blur dark:border-white/[0.08] dark:bg-zinc-900/40">
              <p className={cn("text-lg font-medium", primaryText)}>
                No active deals right now
              </p>
              <p className={cn("mt-2", secondaryText)}>
                Check back soon for new specials.
              </p>
              <Button asChild className="mt-6 rounded-full" variant="pill">
                <Link href="/menu">Browse Menu</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              {comboDeals.length > 0 ? (
                <section className="space-y-6">
                  <div className="flex items-end justify-between gap-4">
                    <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                      Meal combos
                    </h2>
                    <p className={cn("hidden text-sm sm:block", secondaryText)}>
                      Pick your items · fixed price
                    </p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {comboDeals.map((deal) => (
                      <ComboDealCard
                        deal={deal}
                        key={deal.id}
                        onOrder={() => setActiveCombo(deal)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {featured.length > 0 ? (
                <section className="space-y-6">
                  <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                    Featured promos
                  </h2>
                  <div className="grid gap-5 lg:grid-cols-2">
                    {featured.map((deal) => (
                      <PromoDealCard deal={deal} featured key={deal.id} />
                    ))}
                  </div>
                </section>
              ) : null}

              {regular.length > 0 ? (
                <section className="space-y-6">
                  <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                    {featured.length > 0 || comboDeals.length > 0
                      ? "More promotions"
                      : "Promotions"}
                  </h2>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {regular.map((deal) => (
                      <PromoDealCard deal={deal} key={deal.id} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {activeCombo ? (
        <ComboConfiguratorModal
          deal={activeCombo}
          menuItems={menuItems}
          onClose={() => setActiveCombo(null)}
          open={Boolean(activeCombo)}
        />
      ) : null}
    </main>
  );
}

function ComboDealCard({
  deal,
  onOrder,
}: {
  deal: ComboDeal;
  onOrder: () => void;
}): React.ReactElement {
  const imageSrc =
    resolveMediaUrl(deal.imageUrl) ??
    deal.imageUrl ??
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80";
  const price = Number(deal.bundlePrice);
  const slotCount = deal.slots?.length ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-accent,#d81b60)]/35 hover:shadow-[0_16px_40px_rgba(216,27,96,0.12)] dark:border-white/[0.08] dark:bg-zinc-900/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <SmartImage
          alt={deal.imageAlt || deal.name}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          frameClassName="absolute inset-0"
          sizes="33vw"
          src={imageSrc}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-[color:var(--brand-accent,#d81b60)] shadow-sm backdrop-blur">
          {formatCurrency(price)}
        </span>
        {slotCount > 0 ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {slotCount} pick{slotCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className={cn("font-display text-xl font-bold tracking-tight", primaryText)}>
          {deal.name}
        </h3>
        <p className={cn("mt-2 flex-1 text-sm leading-relaxed", secondaryText)}>
          {deal.description}
        </p>
        <Button
          className="mt-5 w-full rounded-full"
          onClick={onOrder}
          type="button"
          variant="pill"
        >
          Build combo
        </Button>
      </div>
    </article>
  );
}

function PromoDealCard({
  deal,
  featured = false,
}: {
  deal: Deal;
  featured?: boolean;
}): React.ReactElement {
  const imageUrl =
    deal.imageUrl ??
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBvLbch0jQ5PYw35jNjOwWrBuRd7eU_GlrTVGHvtPk_llIBerZFSgY2-RGO1dkxZpRa0FX5hKSYfkpRZWQRQksuFZZNgBNXgziC80aEEXAonKXkXEUYm4mwhAe2yXLjnYzXeQco1l4G3bHIp2nG1Qx7a-toviugVlrlrKmuQ3TJCB6mWpuKtKNdc6U62q70HyfIP3rarjnJI9-VWRee5BI3XwPb_CVeEzmfQrbaLax7OCoHPN4g82XSYhXqCFl6xZSnspMSAzb2QnU";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-accent,#d81b60)]/35 hover:shadow-[0_16px_40px_rgba(216,27,96,0.12)] dark:border-white/[0.08] dark:bg-zinc-900/50",
        featured ? "lg:flex lg:min-h-[280px]" : "",
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "lg:w-2/5 lg:min-h-full" : "aspect-[16/10]")}>
        <Image
          alt={deal.imageAlt ?? deal.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          sizes={featured ? "40vw" : "33vw"}
          src={imageUrl}
        />
        <span className="absolute left-3 top-3 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          {formatDealBadge(deal)}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-5", featured ? "lg:p-8" : "")}>
        <h3 className={cn("font-display text-xl font-bold tracking-tight", primaryText)}>
          {deal.title}
        </h3>
        <p className={cn("mt-2 flex-1 text-sm leading-relaxed", secondaryText)}>
          {deal.description}
        </p>

        {deal.promoCode ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--brand-accent,#d81b60)]/40 bg-[color:var(--brand-accent,#d81b60)]/5 px-3 py-2 text-sm">
            <Tag className="h-4 w-4 text-[color:var(--brand-accent,#d81b60)]" />
            <span className={secondaryText}>Code:</span>
            <span className="font-mono font-bold text-[color:var(--brand-accent,#d81b60)]">
              {deal.promoCode}
            </span>
          </div>
        ) : null}

        {deal.termsNote ? (
          <p className={cn("mt-3 text-xs italic", secondaryText)}>{deal.termsNote}</p>
        ) : null}

        <Button asChild className="mt-5 w-full rounded-full sm:w-auto" variant="pill">
          <Link href="/menu">Order now</Link>
        </Button>
      </div>
    </article>
  );
}
