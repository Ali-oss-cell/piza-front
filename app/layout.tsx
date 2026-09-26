import type { Metadata } from "next";
import Script from "next/script";
import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";
import { AppShell } from "@/components/layout/app-shell";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { CartProvider } from "@/lib/cart-context";
import { montserrat } from "@/lib/fonts";
import { pageShell } from "@/lib/theme-classes";
import {
  fetchStoreSettings,
  resolveStoreByHost,
} from "@/lib/menu-api";
import {
  buildSeoMetadata,
  fetchSeoForPage,
  resolveBrandSlugForRequest,
  siteOriginFromHost,
} from "@/lib/seo-server";
import {
  getRequestHost,
  isPrimaryWebHost,
} from "@/lib/request-host";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import {
  DEFAULT_BG_DARK,
  DEFAULT_BG_LIGHT,
  PLATFORM_ACCENT,
} from "@/lib/store-theme";
import { suburbFromAddress } from "@/lib/store-contact";
import { cn } from "@/lib/utils";
import {
  BENNY_BOYS_LOGO_DARK,
  BENNY_BOYS_LOGO_LIGHT,
  BENNY_BOYS_NAME,
  DEFAULT_BRAND_SLUG,
} from "@/types/brand";
import "./globals.css";

const DEFAULT_DELIVERY_FEE = 5;

const bodyFont = montserrat;

export async function generateMetadata(): Promise<Metadata> {
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const origin = siteOriginFromHost(host);
  try {
    const [seo, settings] = await Promise.all([
      fetchSeoForPage(brandSlug, "home", host),
      fetchStoreSettings(brandSlug),
    ]);
    const suburb = suburbFromAddress(settings.address) ?? "Wantirna South";
    const ogImage =
      seo.meta.ogImageUrl ||
      settings.heroImageUrl ||
      settings.logoUrl ||
      undefined;
    return buildSeoMetadata(
      {
        ...seo,
        meta: {
          ...seo.meta,
          ogImageUrl: ogImage,
        },
      },
      {
        title: `Pizza Delivery ${suburb} | ${settings.storeName}`,
        description:
          settings.tagline
            ? `${settings.tagline} — order pizza delivery or pickup from ${settings.storeName}, ${suburb}.`
            : `Order pizza delivery or pickup from ${settings.storeName}, ${suburb}. Fresh pizzas, pasta, and deals — order online now.`,
      },
      origin,
      {
        googleSiteVerification: settings.googleSiteVerification,
        canonicalPath: "/",
      },
    );
  } catch {
    return {
      title: `Pizza Delivery Wantirna South | ${BENNY_BOYS_NAME}`,
      description:
        "Bold flavours · Fresh bites — order pizza delivery or pickup from Benny Boy's, Wantirna South.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  let deliveryFee = DEFAULT_DELIVERY_FEE;
  const defaultLogoUrl = BENNY_BOYS_LOGO_LIGHT;
  const defaultLogoDarkUrl = BENNY_BOYS_LOGO_DARK;

  let brandSlug = DEFAULT_BRAND_SLUG;
  let locationId: string | null = null;
  let initialBranding = {
    brandSlug: DEFAULT_BRAND_SLUG,
    brandName: BENNY_BOYS_NAME,
    logoUrl: defaultLogoUrl as string | null,
    logoDarkUrl: defaultLogoDarkUrl as string | null,
    tagline: null as string | null,
    address: null as string | null,
    openingHours: null as unknown,
    primaryColor: PLATFORM_ACCENT as string | null,
    secondaryColor: "#111827" as string | null,
    backgroundLightColor: DEFAULT_BG_LIGHT as string | null,
    backgroundDarkColor: DEFAULT_BG_DARK as string | null,
    darkModeEnabled: true,
    contactPhone: null as string | null,
  };

  try {
    const host = await getRequestHost();
    if (host && !isPrimaryWebHost(host)) {
      try {
        const store = await resolveStoreByHost(host);
        brandSlug = store.slug;
        locationId = store.locationId ?? null;
        initialBranding = {
          brandSlug: store.slug,
          brandName: store.name,
          logoUrl: store.logoUrl ?? null,
          logoDarkUrl: store.logoDarkUrl ?? null,
          tagline: store.tagline ?? null,
          address: null,
          openingHours: null,
          primaryColor: store.primaryColor ?? PLATFORM_ACCENT,
          secondaryColor: store.secondaryColor ?? "#111827",
          backgroundLightColor: store.backgroundLightColor ?? DEFAULT_BG_LIGHT,
          backgroundDarkColor: store.backgroundDarkColor ?? DEFAULT_BG_DARK,
          darkModeEnabled: store.darkModeEnabled !== false,
          contactPhone: null,
        };
      } catch {
        // Unknown custom host — fall through to primary brand settings.
      }
    }

    const settings = await fetchStoreSettings(brandSlug, locationId);
    deliveryFee = Number(settings.deliveryFee) || DEFAULT_DELIVERY_FEE;
    initialBranding = {
      brandSlug,
      brandName: settings.storeName || initialBranding.brandName,
      logoUrl: settings.logoUrl || initialBranding.logoUrl || defaultLogoUrl,
      logoDarkUrl:
        settings.logoDarkUrl ||
        initialBranding.logoDarkUrl ||
        defaultLogoDarkUrl,
      tagline: settings.tagline ?? initialBranding.tagline,
      address: settings.address ?? null,
      openingHours: settings.openingHours ?? null,
      primaryColor: settings.primaryColor ?? initialBranding.primaryColor,
      secondaryColor: settings.secondaryColor ?? initialBranding.secondaryColor,
      backgroundLightColor:
        settings.backgroundLightColor ?? initialBranding.backgroundLightColor,
      backgroundDarkColor:
        settings.backgroundDarkColor ?? initialBranding.backgroundDarkColor,
      darkModeEnabled: settings.darkModeEnabled !== false,
      contactPhone: settings.contactPhone ?? null,
    };
  } catch {
    // keep defaults with bundled logos
  }

  const origin = siteOriginFromHost(await getRequestHost());
  const absoluteImage = initialBranding.logoUrl
    ? initialBranding.logoUrl.startsWith("http")
      ? initialBranding.logoUrl
      : `${origin}${initialBranding.logoUrl}`
    : undefined;

  return (
    <html
      lang="en"
      className={bodyFont.variable}
      style={{
        "--brand-accent": initialBranding.primaryColor ?? PLATFORM_ACCENT,
        "--brand-primary": initialBranding.primaryColor ?? PLATFORM_ACCENT,
        "--brand-bg-light": initialBranding.backgroundLightColor ?? DEFAULT_BG_LIGHT,
        "--brand-bg-dark": initialBranding.backgroundDarkColor ?? DEFAULT_BG_DARK,
      } as React.CSSProperties}
      suppressHydrationWarning
    >
      <body
        className={cn("flex min-h-full flex-col", pageShell)}
        suppressHydrationWarning
      >
        <LocalBusinessJsonLd
          address={initialBranding.address}
          image={absoluteImage}
          menuUrl={`${origin}/menu`}
          name={initialBranding.brandName}
          openingHours={initialBranding.openingHours}
          telephone={initialBranding.contactPhone}
          url={origin}
        />
        <Script
          dangerouslySetInnerHTML={{
            __html: `(function(){var a=["bis_skin_checked","bis_register"];function s(n){if(!n||n.nodeType!==1)return;for(var i=0;i<a.length;i++)n.hasAttribute(a[i])&&n.removeAttribute(a[i]);for(var c=n.children,j=0;j<c.length;j++)s(c[j])}function c(){s(document.documentElement)}c();new MutationObserver(function(r){for(var i=0;i<r.length;i++){var e=r[i];if(e.type==="attributes"&&a.indexOf(e.attributeName)!==-1)e.target.removeAttribute(e.attributeName);else if(e.type==="childList")for(var n=0;n<e.addedNodes.length;n++)s(e.addedNodes[n])}c()}).observe(document.documentElement,{attributes:!0,childList:!0,subtree:!0,attributeFilter:a})})();`,
          }}
          id="strip-extension-hydration-attrs"
          strategy="beforeInteractive"
        />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider deliveryFee={deliveryFee}>
              <ChunkLoadRecovery />
              <SiteBrandInit brandSlug={brandSlug} locationId={locationId} />
              <AppShell initialBranding={initialBranding}>{children}</AppShell>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
