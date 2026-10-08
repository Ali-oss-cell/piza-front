"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CategoryTabs } from "@/components/features/category-tabs";
import { CtaBand } from "@/components/features/content/cta-band";
import { HeroSection } from "@/components/features/hero-section";
import { MenuGrid } from "@/components/features/menu-grid";
import {
  DealsShowcase,
  HowItWorks,
  OrderCta,
  PopularPicks,
  VisitUs,
  pickPopularItems,
} from "@/components/features/storefront/home-sections";
import type { StorefrontProps } from "@/components/features/storefront/types";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { useCart } from "@/lib/cart-context";
import { isNextOrderOrderingEnabled, ORDER_ONLINE_HREF } from "@/lib/nextorder";
import type { MenuItem } from "@/types/menu";

export function ClassicStorefront({
  menuItems,
  categories,
  brandName,
  brandSlug,
  tagline,
  heroImageUrl,
  heroImageDarkUrl,
  primaryColor,
  backgroundLightColor,
  backgroundDarkColor,
  address,
  deliveryFee,
  openingHours,
  contactPhone,
  minOrderAmount,
  variant = "home",
}: StorefrontProps): React.ReactElement {
  const { addToCart, setCartOpen } = useCart();
  const menuSectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.value ?? "deals");
  const useNextOrder = isNextOrderOrderingEnabled();
  const isHome = variant === "home";

  const featuredDeals = useMemo(
    () =>
      menuItems
        .filter((item) => item.category === "deals")
        .sort((a, b) => a.number - b.number),
    [menuItems],
  );
  const popularItems = useMemo(() => pickPopularItems(menuItems), [menuItems]);

  const scrollToMenu = useCallback(() => {
    menuSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleViewDeal = useCallback(
    (deal: MenuItem) => {
      setActiveCategory(deal.category);
      requestAnimationFrame(() => scrollToMenu());
    },
    [scrollToMenu],
  );

  const menuBlock = useNextOrder ? (
    <MotionReveal as="div">
      <CtaBand
        className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12"
        description="Pizza, pasta, deals, and sides — order pickup or delivery through our online menu."
        primaryHref={ORDER_ONLINE_HREF}
        primaryLabel="Browse Full Menu"
        secondaryHref="/deals"
        secondaryLabel="View Specials"
        title="Ready to order?"
      />
    </MotionReveal>
  ) : (
    <MotionReveal as="div" delay={0.05}>
      {/* scroll-mt clears the fixed header when "View deal" jumps here. */}
      <div className="scroll-mt-20" id="menu" ref={menuSectionRef}>
        {isHome ? (
          <div className="mx-auto max-w-container-max px-margin-mobile pt-14 md:px-margin-desktop md:pt-20">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--brand-accent,#d81b60)]">
              Our menu
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
              Everything, made fresh to order
            </h2>
          </div>
        ) : null}
        <CategoryTabs
          activeCategory={activeCategory}
          categories={categories}
          onSelectCategory={setActiveCategory}
        />
        <MenuGrid
          activeCategory={activeCategory}
          brandSlug={brandSlug}
          items={menuItems}
          onAddToCart={addToCart}
        />
      </div>
    </MotionReveal>
  );

  return (
    <main className="pt-20 transition-colors duration-150 ease-out">
      <HeroSection
        backgroundDarkColor={backgroundDarkColor}
        backgroundLightColor={backgroundLightColor}
        brandName={brandName}
        brandSlug={brandSlug}
        deliveryFee={deliveryFee}
        /* Home shows deals in their own section below; avoid listing them twice. */
        featuredDeals={isHome ? [] : featuredDeals}
        heroImageDarkUrl={heroImageDarkUrl}
        heroImageUrl={heroImageUrl}
        minOrderAmount={minOrderAmount}
        onOpenCart={() => setCartOpen(true)}
        onViewDeal={handleViewDeal}
        openingHours={openingHours}
        primaryColor={primaryColor}
        tagline={tagline}
        variant={variant}
      />

      {isHome ? (
        <>
          <DealsShowcase brandSlug={brandSlug} deals={featuredDeals} />
          {useNextOrder ? null : (
            <PopularPicks
              brandSlug={brandSlug}
              items={popularItems}
              onAddToCart={addToCart}
              onBrowseMenu={scrollToMenu}
            />
          )}
          {menuBlock}
          <HowItWorks />
          <VisitUs
            address={address}
            brandName={brandName}
            contactPhone={contactPhone}
            deliveryFee={deliveryFee}
            minOrderAmount={minOrderAmount}
            openingHours={openingHours}
          />
          <OrderCta
            onOrder={useNextOrder ? undefined : scrollToMenu}
            orderHref={useNextOrder ? ORDER_ONLINE_HREF : undefined}
          />
        </>
      ) : (
        menuBlock
      )}
    </main>
  );
}
