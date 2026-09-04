import type { Metadata } from "next";
import { BlogPageContent } from "@/components/features/blog/blog-page-content";
import SeoMetaClient from "@/components/SeoMetaClient";
import {
  generateContentPageMetadata,
  getContentPageBrandSlug,
  getContentPageStoreName,
} from "@/lib/content-page-server";
import { getRequestHost } from "@/lib/request-host";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateContentPageMetadata({
    pageKey: "blog",
    title: "Blog",
    description: "News, kitchen stories, and updates from {storeName}.",
  });
}

export default async function BlogPage(): Promise<React.ReactElement> {
  const [brandSlug, storeName, host] = await Promise.all([
    getContentPageBrandSlug(),
    getContentPageStoreName(),
    getRequestHost(),
  ]);

  return (
    <>
      <SeoMetaClient fallbackTitle={`Blog | ${storeName}`} pageKey="blog" />
      <BlogPageContent brandSlug={brandSlug} host={host ?? undefined} />
    </>
  );
}
