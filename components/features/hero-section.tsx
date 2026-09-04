"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import {
  defaultTransition,
  fadeUp,
  fadeUpReduced,
  pageHeroBg,
  staggerContainer,
  staggerItem,
  staggerItemReduced,
} from "@/lib/motion-presets";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { resolveMediaUrl } from "@/lib/media-url";
import { PLATFORM_ACCENT } from "@/lib/store-theme";
import { cn } from "@/lib/utils";
import {
  BENNY_BOYS_HERO_LINE_1,
  BENNY_BOYS_HERO_LINE_2,
  BENNY_BOYS_TAGLINE,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";
import type { MenuItem } from "@/types/menu";

const DEFAULT_HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBvLbch0jQ5PYw35jNjOwWrBuRd7eU_GlrTVGHvtPk_llIBerZFSgY2-RGO1dkxZpRa0FX5hKSYfkpRZWQRQksuFZZNgBNXgziC80aEEXAonKXkXEUYm4mwhAe2yXLjnYzXeQco1l4G3bHIp2nG1Qx7a-toviugVlrlrKmuQ3TJCB6mWpuKtKNdc6U62q70HyfIP3rarjnJI9-VWRee5BI3XwPb_CVeEzmfQrbaLax7OCoHPN4g82XSYhXqCFl6xZSnspMSAzb2QnU";

interface HeroSectionProps {
  onOpenCart: () => void;
  onViewDeal?: (item: MenuItem) => void;
  featuredDeals?: MenuItem[];
  brandName?: string;
  brandSlug?: string;
  tagline?: string;
  heroImageUrl?: string | null;
  heroImageDarkUrl?: string | null;
  primaryColor?: string | null;
  backgroundLightColor?: string | null;
  backgroundDarkColor?: string | null;
  variant?: "home" | "menu";
}

function formatPrice(price: number): string {
  return `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

export function HeroSection({
  onOpenCart,
  onViewDeal,
  featuredDeals = [],
  brandSlug,
  tagline,
  heroImageUrl,
  heroImageDarkUrl,
  primaryColor,
  backgroundLightColor,
  backgroundDarkColor,
  variant = "home",
}: HeroSectionProps): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const slug = brandSlug?.toLowerCase() ?? DEFAULT_BRAND_SLUG;
  const isBennyBoys = slug.includes("benny") || slug.includes("bunny");

  const brandPrimary = primaryColor?.trim() || PLATFORM_ACCENT;
  const bgLight = backgroundLightColor?.trim() || "#ffffff";
  const bgDark = backgroundDarkColor?.trim() || "#000000";

  const lightHero = resolveMediaUrl(heroImageUrl) ?? DEFAULT_HERO;
  const darkHero =
    resolveMediaUrl(heroImageDarkUrl) ?? resolveMediaUrl(heroImageUrl) ?? DEFAULT_HERO;
  const isDark = resolvedTheme === "dark";
  const heroSrc = isDark ? darkHero : lightHero;

  const heroStyle = {
    "--brand-primary": brandPrimary,
    "--brand-accent": brandPrimary,
    "--brand-bg-light": bgLight,
    "--brand-bg-dark": bgDark,
  } as React.CSSProperties;

  const subtitle =
    variant === "menu"
      ? tagline?.trim() || "Browse our full menu — pickup and delivery available."
      : tagline?.trim() ||
        (isBennyBoys
          ? `${BENNY_BOYS_TAGLINE} — order pickup & delivery online.`
          : "Artisanal sourdough foundations, heritage recipes, and contemporary culinary precision delivered to your urban doorstep.");

  const promos = featuredDeals.slice(0, 3);
  const useNextOrder = isNextOrderOrderingEnabled();
  const textVariants = reduceMotion ? fadeUpReduced : fadeUp;
  const itemVariants = reduceMotion ? staggerItemReduced : staggerItem;

  return (
    <section
      className="relative flex min-h-[min(100vh,920px)] min-h-[680px] flex-col justify-center overflow-hidden px-margin-mobile transition-colors duration-150 ease-out md:min-h-[min(100vh,960px)] md:px-margin-desktop"
      style={heroStyle}
    >
      <motion.div
        animate="visible"
        className="absolute inset-0 z-0"
        initial="hidden"
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        variants={reduceMotion ? undefined : pageHeroBg}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="h-full w-full scale-105 object-cover object-center opacity-95"
          src={heroSrc}
        />
        <div
          className="absolute inset-0 transition-colors duration-150 ease-out"
          style={{
            backgroundImage: isDark
              ? `linear-gradient(to bottom, ${bgDark}dd 0%, ${bgDark}88 35%, ${bgDark}44 55%, ${bgDark}22 72%, transparent 88%), linear-gradient(to right, ${bgDark}cc 0%, ${bgDark}66 28%, transparent 52%)`
              : `linear-gradient(to bottom, ${bgLight}dd 0%, ${bgLight}88 35%, ${bgLight}55 55%, ${bgLight}22 72%, transparent 88%), linear-gradient(to right, ${bgLight}cc 0%, ${bgLight}66 28%, transparent 52%)`,
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-container-max flex-1 flex-col justify-center py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-12">
          <motion.div
            animate="visible"
            className="max-w-2xl space-y-8"
            initial="hidden"
            variants={staggerContainer}
          >
            <motion.h1
              className="font-display text-headline-xl leading-none tracking-tight text-zinc-950 transition-colors duration-150 ease-out dark:text-white"
              transition={defaultTransition}
              variants={itemVariants}
            >
              {variant === "menu" ? (
                <>
                  OUR <br />
                  <span className="text-[color:var(--brand-accent)]">MENU</span>
                </>
              ) : isBennyBoys ? (
                <>
                  {BENNY_BOYS_HERO_LINE_1} <br />
                  <span className="text-[color:var(--brand-accent)]">{BENNY_BOYS_HERO_LINE_2}</span>
                </>
              ) : (
                <>
                  PIZZA & <br />
                  PASTA <span className="text-[color:var(--brand-accent)]">REFINED.</span>
                </>
              )}
            </motion.h1>
            <motion.p
              className="max-w-lg text-body-lg text-zinc-700 transition-colors duration-150 ease-out dark:text-zinc-300"
              transition={defaultTransition}
              variants={itemVariants}
            >
              {subtitle}
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 pt-2"
              transition={defaultTransition}
              variants={itemVariants}
            >
              {useNextOrder ? (
                <Button asChild className="h-12 px-8 uppercase tracking-[0.15em]">
                  <Link href={ORDER_ONLINE_HREF}>Order Online</Link>
                </Button>
              ) : (
                <Button
                  className="h-12 px-8 uppercase tracking-[0.15em]"
                  onClick={onOpenCart}
                >
                  Order Online
                </Button>
              )}
              <Button
                asChild
                className="h-12 border-[color:var(--brand-accent)] px-8 uppercase tracking-[0.15em] text-[color:var(--brand-accent)] hover:bg-[color:var(--brand-accent)] hover:text-white dark:border-[color:var(--brand-accent)] dark:text-[color:var(--brand-accent)] dark:hover:bg-[color:var(--brand-accent)] dark:hover:text-white"
                variant="outline"
              >
                <Link href="/deals">View Specials</Link>
              </Button>
            </motion.div>
          </motion.div>

          {promos.length > 0 ? (
            <motion.div
              animate="visible"
              className="flex flex-col gap-3 lg:max-w-md lg:justify-self-end"
              initial="hidden"
              transition={{ delayChildren: 0.28, staggerChildren: 0.1 }}
              variants={staggerContainer}
            >
              <motion.p
                className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-700 dark:text-zinc-300"
                transition={defaultTransition}
                variants={textVariants}
              >
                Today&apos;s top deals
              </motion.p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {promos.map((deal) =>
                  useNextOrder ? (
                    <motion.div key={deal.id} transition={defaultTransition} variants={itemVariants}>
                      <Link
                        className={cn(
                          "block rounded-2xl border border-zinc-200/80 bg-white/90 p-4 text-left shadow-lg backdrop-blur-md transition-all",
                          "hover:border-[color:var(--brand-accent,#d81b60)]/40 hover:shadow-xl",
                          "dark:border-zinc-700/80 dark:bg-zinc-950/85"
                        )}
                        href={ORDER_ONLINE_HREF}
                      >
                        <DealPromoContent brandSlug={brandSlug} deal={deal} />
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div key={deal.id} transition={defaultTransition} variants={itemVariants}>
                      <button
                        className={cn(
                          "w-full rounded-2xl border border-zinc-200/80 bg-white/90 p-4 text-left shadow-lg backdrop-blur-md transition-all",
                          "hover:border-[color:var(--brand-accent,#d81b60)]/40 hover:shadow-xl",
                          "dark:border-zinc-700/80 dark:bg-zinc-950/85"
                        )}
                        onClick={() => onViewDeal?.(deal)}
                        type="button"
                      >
                        <DealPromoContent brandSlug={brandSlug} deal={deal} />
                      </button>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DealPromoContent({
  deal,
  brandSlug,
}: {
  deal: MenuItem;
  brandSlug?: string;
}): React.ReactElement {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-zinc-950 dark:text-white">{deal.name}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            {getMenuDisplayDescription(deal, brandSlug)}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {formatPrice(deal.price)}
        </span>
      </div>
      <span className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-accent,#d81b60)]">
        View deal →
      </span>
    </>
  );
}
