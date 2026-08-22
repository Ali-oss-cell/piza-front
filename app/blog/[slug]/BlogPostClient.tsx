"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { fetchBlogPost, type BlogPostRecord } from "@/lib/seo-api";
import { resolveMediaUrl } from "@/lib/media-url";

interface BlogPostClientProps {
  slug: string;
  baseUrl: string;
  brandSlug: string;
  host?: string;
}

export function BlogPostClient({
  slug,
  baseUrl,
  brandSlug,
  host,
}: BlogPostClientProps): React.ReactElement {
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchBlogPost(slug, brandSlug, null, undefined, host)
      .then(setPost)
      .catch(() => setError("Post not found"));
  }, [slug, brandSlug, host]);

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
  const image = post.thumbnail?.filePath
    ? resolveMediaUrl(post.thumbnail.filePath) ?? post.thumbnail.filePath
    : null;

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
        image={image}
        title={post.title}
        url={postUrl}
      />
      <Link className="text-sm text-pink-600" href="/blog">
        ← Back to blog
      </Link>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={post.title} className="mt-6 h-64 w-full rounded-2xl object-cover" src={image} />
      ) : null}
      <h1 className="mt-4 font-display text-4xl font-bold">{post.title}</h1>
      {post.author || post.category ? (
        <p className="mt-2 text-sm text-zinc-500">
          {[post.author, post.category].filter(Boolean).join(" · ")}
        </p>
      ) : null}
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
