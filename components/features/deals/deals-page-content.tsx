"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatCurrency } from "@/lib/pricing";
import { formatDealBadge } from "@/types/deals";
import type { Deal } from "@/types/deals";
import type { MenuItem } from "@/types/menu";
import { pageShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface DealsPageContentProps {
  /** Promo codes / %-$ off from Admin → Promo deals */
  promoDeals: Deal[];
  /** Combo meal deals from Menu → Deals category */
  menuDeals: MenuItem[];
}

export function DealsPageContent({
  promoDeals,
  menuDeals,
}: DealsPageContentProps): React.ReactElement {
  const featured = promoDeals.filter((deal) => deal.isFeatured);
  const regular = promoDeals.filter((deal) => !deal.isFeatured);
  const hasAny = menuDeals.length > 0 || promoDeals.length > 0;

  return (
    <main className={cn("min-h-screen pt-24", pageShell)}>
      <section className="mx-auto max-w-container-max px-margin-mobile pb-16 pt-10 md:px-margin-desktop">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-accent,#d81b60)]">
            Exclusive Offers
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Deals</h1>
          <p className={cn("mt-4 text-lg", secondaryText)}>
            Combo meal specials and limited-time promotions. Order online for pickup or delivery.
          </p>
        </div>

        {!hasAny ? (
          <div className="mt-16 rounded-2xl border border-dashed border-zinc-300/70 bg-white/50 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:border-white/[0.08] dark:bg-zinc-900/30">
            <p className={cn("text-lg font-medium", primaryText)}>No active deals right now</p>
            <p className={cn("mt-2", secondaryText)}>Check back soon for new specials.</p>
            <Button asChild className="mt-6 rounded-full" variant="pill">
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {menuDeals.length > 0 ? (
              <section className="space-y-6">
                <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                  Combo deals
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {menuDeals.map((item) => (
                    <MenuDealCard item={item} key={item.id} />
                  ))}
                </div>
              </section>
            ) : null}

            {featured.length > 0 ? (
              <section className="space-y-6">
                <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                  Featured promos
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {featured.map((deal) => (
                    <PromoDealCard deal={deal} featured key={deal.id} />
                  ))}
                </div>
              </section>
            ) : null}

            {regular.length > 0 ? (
              <section className="space-y-6">
                <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
                  {featured.length > 0 || menuDeals.length > 0
                    ? "More promotions"
                    : "Promotions"}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {regular.map((deal) => (
                    <PromoDealCard deal={deal} key={deal.id} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function MenuDealCard({ item }: { item: MenuItem }): React.ReactElement {
  const imageSrc = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const href = `/menu/${item.slug || item.id}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--brand-accent,#d81b60)]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-white/[0.08] dark:bg-zinc-900/40">
      <div className="relative h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <SmartImage
          alt={item.imageAlt || item.name}
          blurHash={item.imageBlurHash}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          frameClassName="absolute inset-0"
          sizes="33vw"
          src={imageSrc}
        />
        <span className="absolute left-4 top-4 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          {formatCurrency(item.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className={cn("font-display text-xl font-bold", primaryText)}>{item.name}</h3>
        <p className={cn("mt-3 flex-1 text-sm leading-relaxed", secondaryText)}>
          {item.description}
        </p>
        <Button asChild className="mt-5 w-full rounded-full uppercase tracking-widest sm:w-auto" variant="pill">
          <Link href={href}>Order now</Link>
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
        "group overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--brand-accent,#d81b60)]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-white/[0.08] dark:bg-zinc-900/40",
        featured ? "lg:flex lg:min-h-[280px]" : ""
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "lg:w-2/5 lg:min-h-full" : "h-48")}>
        <Image
          alt={deal.imageAlt ?? deal.title}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          fill
          sizes={featured ? "40vw" : "33vw"}
          src={imageUrl}
        />
        <span className="absolute left-4 top-4 rounded-full bg-[color:var(--brand-accent,#d81b60)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
          {formatDealBadge(deal)}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured ? "lg:p-8" : "")}>
        <h3 className={cn("font-display text-xl font-bold", primaryText)}>{deal.title}</h3>
        <p className={cn("mt-3 flex-1 text-sm leading-relaxed", secondaryText)}>{deal.description}</p>

        {deal.promoCode ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-[color:var(--brand-accent,#d81b60)]/40 bg-[color:var(--brand-accent,#d81b60)]/5 px-3 py-2 text-sm">
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

        <Button asChild className="mt-5 w-full rounded-full uppercase tracking-widest sm:w-auto" variant="pill">
          <Link href={deal.ctaHref}>{deal.ctaLabel}</Link>
        </Button>
      </div>
    </article>
  );
}
