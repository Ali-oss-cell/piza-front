import type { Metadata } from "next";
import Script from "next/script";
import { AppShell } from "@/components/layout/app-shell";
import { CartProvider } from "@/lib/cart-context";
import { montserrat } from "@/lib/fonts";
import { fetchStoreSettings } from "@/lib/menu-api";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";
import "./globals.css";

const DEFAULT_DELIVERY_FEE = 5;

const bodyFont = montserrat;

export const metadata: Metadata = {
  title: "Leovorno | Pizza & Pasta Refined",
  description: "Premium pizza and pasta ordering experience",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let deliveryFee = DEFAULT_DELIVERY_FEE;
  // Bundled fallbacks so Leovorno shows logos on marinapizzas.com.au before admin upload.
  const defaultLogoUrl = "/leovorno-logo-light.png";
  const defaultLogoDarkUrl = "/leovorno-logo-dark.png";

  let initialBranding = {
    brandSlug: DEFAULT_BRAND_SLUG,
    brandName: "Leovorno",
    logoUrl: defaultLogoUrl as string | null,
    logoDarkUrl: defaultLogoDarkUrl as string | null,
    tagline: null as string | null,
    address: null as string | null,
    openingHours: null as unknown,
    primaryColor: "#d81b60" as string | null,
    secondaryColor: "#111827" as string | null,
  };

  try {
    // marinapizzas.com.au hosts Leovorno for now
    const settings = await fetchStoreSettings(DEFAULT_BRAND_SLUG);
    deliveryFee = Number(settings.deliveryFee) || DEFAULT_DELIVERY_FEE;
    initialBranding = {
      brandSlug: DEFAULT_BRAND_SLUG,
      brandName: settings.storeName || "Leovorno",
      logoUrl: settings.logoUrl || defaultLogoUrl,
      logoDarkUrl: settings.logoDarkUrl || defaultLogoDarkUrl,
      tagline: settings.tagline ?? null,
      address: settings.address ?? null,
      openingHours: settings.openingHours ?? null,
      primaryColor: settings.primaryColor ?? "#d81b60",
      secondaryColor: settings.secondaryColor ?? "#111827",
    };
  } catch {
    // keep defaults with bundled logos
  }

  return (
    <html
      lang="en"
      className={bodyFont.variable}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-white text-zinc-950 dark:bg-black dark:text-white"
        suppressHydrationWarning
      >
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
              <AppShell initialBranding={initialBranding}>{children}</AppShell>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
