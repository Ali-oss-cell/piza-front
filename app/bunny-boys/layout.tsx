import type { Metadata } from "next";
import { SiteBrandInit } from "@/components/layout/site-brand-init";
import { BUNNY_BOYS_SLUG } from "@/types/brand";

export const metadata: Metadata = {
  title: "Bunny Boys | Burgers, Wings & Good Times",
  description: "Order from Bunny Boys — burgers, sides, and drinks.",
};

export default function BunnyBoysLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <SiteBrandInit brandSlug={BUNNY_BOYS_SLUG} />
      {children}
    </>
  );
}
