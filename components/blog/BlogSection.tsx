"use client";

import Link from "next/link";
import { useSeoContent } from "@/hooks/useSeoContent";
import { fetchBlogPosts, type BlogPostRecord } from "@/lib/seo-api";
import { getSiteBrandSlug } from "@/lib/brand-storage";
import { resolveMediaUrl } from "@/lib/media-url";
import { useEffect, useState } from "react";

export function BlogSection(): React.ReactElement {
  const { sections } = useSeoContent("blog");
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);

  useEffect(() => {
    const slug = getSiteBrandSlug() ?? "leovorno";
    void fetchBlogPosts(undefined, slug).then(setPosts).catch(() => setPosts([]));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          {sections.hero_h1 || "Blog"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          {sections.hero_body || "News and stories from our kitchen."}
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
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
                <Link className="hover:text-pink-600" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt ? (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-500">No published posts yet.</p>
      ) : null}
    </main>
  );
}
