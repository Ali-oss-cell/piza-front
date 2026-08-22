"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { fetchBlogPost, type BlogPostRecord } from "@/lib/seo-api";
import { getSiteBrandSlug } from "@/lib/brand-storage";

interface BlogPostClientProps {
  slug: string;
  baseUrl: string;
}

export function BlogPostClient({ slug, baseUrl }: BlogPostClientProps): React.ReactElement {
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const brandSlug = getSiteBrandSlug() ?? "leovorno";
    void fetchBlogPost(slug, brandSlug)
      .then(setPost)
      .catch(() => setError("Post not found"));
  }, [slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-zinc-500">{error}</p>
        <Link className="mt-4 inline-block text-pink-600" href="/blog">
          Back to blog
        </Link>
      </main>
    );
  }

  if (!post) {
    return <main className="mx-auto max-w-3xl px-4 py-16">Loading…</main>;
  }

  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: post.title, url: postUrl },
        ]}
      />
      <BlogPostingJsonLd
        author={post.author}
        datePublished={post.publishedAt}
        description={post.excerpt}
        title={post.title}
        url={postUrl}
      />
      <Link className="text-sm text-pink-600" href="/blog">
        ← Back to blog
      </Link>
      <h1 className="mt-4 font-display text-4xl font-bold">{post.title}</h1>
      {post.excerpt ? (
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">{post.excerpt}</p>
      ) : null}
      <article
        className="prose prose-zinc mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}
