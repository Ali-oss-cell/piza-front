"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentPageShell } from "@/components/features/content/content-page-shell";
import { ContentSection } from "@/components/features/content/content-section";
import { CtaBand } from "@/components/features/content/cta-band";
import { MotionPageHero } from "@/components/motion/motion-page-hero";
import { MotionReveal } from "@/components/motion/motion-reveal";
import { StaggerGrid } from "@/components/motion/stagger-grid";
import { blogHero, blogStubPosts } from "@/data/blog";
import { fetchBlogPosts, type BlogPostRecord } from "@/lib/seo-api";
import { resolveMediaUrl } from "@/lib/media-url";
import { ORDER_ONLINE_HREF } from "@/lib/nextorder";
import { DEFAULT_BRAND_SLUG } from "@/types/brand";

interface BlogPageContentProps {
  brandSlug?: string;
  host?: string;
}

export function BlogPageContent({
  brandSlug = DEFAULT_BRAND_SLUG,
  host,
}: BlogPageContentProps): React.ReactElement {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchBlogPosts(undefined, brandSlug, null, host)
      .then((result) => {
        if (!cancelled) {
          setPosts(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [brandSlug, host]);

  const showCms = loaded && posts.length > 0;

  return (
    <ContentPageShell>
      <MotionPageHero
        ctas={[
          { label: "Order Now", href: ORDER_ONLINE_HREF },
          { label: "Contact", href: "/contact", variant: "secondary" },
        ]}
        eyebrow={blogHero.eyebrow}
        subtitle={blogHero.subtitle}
        title={blogHero.title}
      />

      {showCms ? (
        <ContentSection title="Latest posts">
          <StaggerGrid className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                className="overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-50/40 dark:border-white/10 dark:bg-zinc-900/30"
                key={post.id}
              >
                {post.thumbnail?.filePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={post.title}
                    className="h-48 w-full object-cover"
                    src={resolveMediaUrl(post.thumbnail.filePath) ?? post.thumbnail.filePath}
                  />
                ) : null}
                <div className="p-5">
                  <h2 className="text-xl font-semibold">
                    <Link
                      className="transition-colors hover:text-[color:var(--brand-accent,#d81b60)]"
                      href={`/blog/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </StaggerGrid>
        </ContentSection>
      ) : (
        <ContentSection
          description="A few reads while we publish more from the kitchen."
          title="From the team"
        >
          <StaggerGrid className="grid gap-6 md:grid-cols-2">
            {blogStubPosts.map((post, index) => (
              <MotionReveal delay={index * 0.05} key={post.slug}>
                <article className="h-full rounded-2xl border border-zinc-200/70 bg-zinc-50/40 p-6 dark:border-white/10 dark:bg-zinc-900/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--brand-accent,#d81b60)]">
                    {post.category} · {post.dateLabel}
                  </p>
                  <h2 className="mt-2 text-xl font-bold">{post.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {post.excerpt}
                  </p>
                  <Link
                    className="mt-4 inline-block text-sm font-semibold text-[color:var(--brand-accent,#d81b60)] hover:underline"
                    href={
                      post.slug.includes("catering")
                        ? "/catering"
                        : post.slug.includes("allergen")
                          ? "/allergens"
                          : post.slug.includes("custom")
                            ? ORDER_ONLINE_HREF
                            : "/about"
                    }
                  >
                    Read related →
                  </Link>
                </article>
              </MotionReveal>
            ))}
          </StaggerGrid>
        </ContentSection>
      )}

      <CtaBand
        description="Skip the scroll — order pizza, pasta, and sides for pickup or delivery."
        primaryHref={ORDER_ONLINE_HREF}
        primaryLabel="Order Online"
        secondaryHref="/deals"
        secondaryLabel="See Deals"
        title="Hungry now?"
      />
    </ContentPageShell>
  );
}
