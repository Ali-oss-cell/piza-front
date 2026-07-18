import type { Metadata } from "next";
import { resolveStoreByPath } from "@/lib/menu-api";

interface StorefrontLayoutProps {
  children: React.ReactNode;
  params: Promise<{ storePath: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storePath: string }>;
}): Promise<Metadata> {
  const { storePath } = await params;

  try {
    const store = await resolveStoreByPath(storePath);
    return {
      title: `${store.name}${store.tagline ? ` | ${store.tagline}` : ""}`,
      description: store.tagline ?? `Order from ${store.name}`,
    };
  } catch {
    return {
      title: "Store not found",
    };
  }
}

export default async function StorefrontLayout({
  children,
}: StorefrontLayoutProps): Promise<React.ReactElement> {
  return <>{children}</>;
}
