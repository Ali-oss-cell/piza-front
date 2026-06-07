"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDealBadge } from "@/types/deals";
import type { Deal } from "@/types/deals";
import { pageShell, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface DealsPageContentProps {
  deals: Deal[];
}

export function DealsPageContent({ deals }: DealsPageContentProps): React.ReactElement {
  const featured = deals.filter((deal) => deal.isFeatured);
  const regular = deals.filter((deal) => !deal.isFeatured);

  return (
    <main className={cn("min-h-screen pt-24", pageShell)}>
      <section className="mx-auto max-w-container-max px-margin-mobile pb-16 pt-10 md:px-margin-desktop">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d81b60]">
            Exclusive Offers
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Deals & Promotions</h1>
          <p className={cn("mt-4 text-lg", secondaryText)}>
            Limited-time savings on your favourite pizzas, pastas, and more. Use a promo code at
            checkout when ordering.
          </p>
        </div>

        {deals.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-zinc-300/70 p-12 text-center dark:border-white/10">
            <p className={cn("text-lg font-medium", primaryText)}>No active deals right now</p>
            <p className={cn("mt-2", secondaryText)}>Check back soon for new promotions.</p>
            <Button asChild className="mt-6">
              <Link href="/">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {featured.length > 0 ? (
              <section className="space-y-6">
                <h2 className={cn("font-display text-2xl font-bold", primaryText)}>Featured</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {featured.map((deal) => (
                    <DealCard deal={deal} featured key={deal.id} />
                  ))}
                </div>
              </section>
            ) : null}

            {regular.length > 0 ? (
              <section className="space-y-6">
                {featured.length > 0 ? (
                  <h2 className={cn("font-display text-2xl font-bold", primaryText)}>More Offers</h2>
                ) : null}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {regular.map((deal) => (
                    <DealCard deal={deal} key={deal.id} />
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

function DealCard({
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
        "group overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-md transition-all duration-150 hover:border-[#d81b60]/30 hover:shadow-xl hover:shadow-[#d81b60]/10 dark:border-white/10 dark:bg-zinc-900/40",
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
        <span className="absolute left-4 top-4 rounded-full bg-[#d81b60] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {formatDealBadge(deal)}
        </span>
      </div>

      <div className={cn("flex flex-1 flex-col p-6", featured ? "lg:p-8" : "")}>
        <h3 className={cn("font-display text-xl font-bold", primaryText)}>{deal.title}</h3>
        <p className={cn("mt-3 flex-1 text-sm leading-relaxed", secondaryText)}>{deal.description}</p>

        {deal.promoCode ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-[#d81b60]/40 bg-[#d81b60]/5 px-3 py-2 text-sm">
            <Tag className="h-4 w-4 text-[#d81b60]" />
            <span className={secondaryText}>Code:</span>
            <span className="font-mono font-bold text-[#d81b60]">{deal.promoCode}</span>
          </div>
        ) : null}

        {deal.termsNote ? (
          <p className={cn("mt-3 text-xs italic", secondaryText)}>{deal.termsNote}</p>
        ) : null}

        <Button asChild className="mt-5 w-full uppercase tracking-widest sm:w-auto">
          <Link href={deal.ctaHref}>{deal.ctaLabel}</Link>
        </Button>
      </div>
    </article>
  );
}
