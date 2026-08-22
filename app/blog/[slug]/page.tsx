import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPostClient } from "./BlogPostClient";
import { fetchBlogPost } from "@/lib/seo-api";
import { buildSeoMetadata, resolveBrandSlugForRequest, siteOriginFromHost } from "@/lib/seo-server";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { brandSlug, host } = await resolveBrandSlugForRequest();

  try {
    const post = await fetchBlogPost(slug, brandSlug, null, undefined, host);
    return buildSeoMetadata(
      {
        sections: {},
        meta: {
          title: post.metaTitle ?? post.title,
          description: post.metaDescription ?? post.excerpt ?? undefined,
          keywords: post.metaKeywords ?? undefined,
          robotsIndex: post.status === "PUBLISHED",
        },
        rows: [],
      },
      { title: post.title, description: post.excerpt ?? post.title },
      siteOriginFromHost(host),
    );
  } catch {
    return { title: "Blog post" };
  }
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const { brandSlug, host } = await resolveBrandSlugForRequest();
  const baseUrl = siteOriginFromHost(host);

  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-16">Loading…</main>}>
      <BlogPostClient baseUrl={baseUrl} brandSlug={brandSlug} host={host} slug={slug} />
    </Suspense>
  );
}
