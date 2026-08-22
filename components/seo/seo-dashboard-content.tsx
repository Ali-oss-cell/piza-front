"use client";

import {
  FileText,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Newspaper,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/seo/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearAuthSession, getStoredToken, getStoredUser } from "@/lib/auth-storage";
import { resolveMediaUrl } from "@/lib/media-url";
import {
  bulkUpsertSeoContent,
  deleteBlogPost,
  deleteSeoImage,
  ensureStarterBlog,
  fetchBlogPosts,
  fetchSeoContentAdmin,
  fetchSeoImages,
  fetchSeoLaunchChecklist,
  fillSeoFromStore,
  IMAGE_SLOTS,
  saveBlogPost,
  SEO_PAGES,
  uploadSeoImage,
  verifySeoImages,
  type BlogPostRecord,
  type SeoContentRow,
  type SeoImageRecord,
} from "@/lib/seo-api";
import { getSeoBrandSlug, setSeoBrandSlug } from "@/lib/seo-storage";
import { canAccessSeoDashboard, type AuthStore } from "@/types/auth";

type Tab = "dashboard" | "pages" | "images" | "blog";

const PAGE_SECTIONS: Record<string, string[]> = {
  home: ["hero_h1", "hero_h2", "hero_body", "hero_image", "page_title"],
  about: ["hero_h1", "hero_body", "hero_image", "page_title"],
  deals: ["hero_h1", "hero_body", "hero_image", "page_title"],
  locations: ["hero_h1", "hero_body", "hero_image", "page_title"],
  blog: ["hero_h1", "hero_body", "hero_image", "page_title"],
};

function storeOptionLabel(store: AuthStore): string {
  return `${store.name} (${store.slug})`;
}

export function SeoDashboardContent(): React.ReactElement {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [token, setToken] = useState<string | null>(null);
  const [stores, setStores] = useState<AuthStore[]>([]);
  const [brandSlug, setBrandSlug] = useState<string>("leovorno");
  const [pageFilter, setPageFilter] = useState<string>("home");
  const [contentRows, setContentRows] = useState<SeoContentRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [metaDraft, setMetaDraft] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImageUrl: "",
    robotsIndex: true,
  });
  const [images, setImages] = useState<SeoImageRecord[]>([]);
  const [missingImages, setMissingImages] = useState<SeoImageRecord[]>([]);
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPostRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Awaited<
    ReturnType<typeof fetchSeoLaunchChecklist>
  > | null>(null);

  useEffect(() => {
    const storedToken = getStoredToken();
    const user = getStoredUser();
    if (!storedToken || !canAccessSeoDashboard(user)) {
      router.replace("/seo-login");
      return;
    }

    setToken(storedToken);
    const userStores = user?.stores ?? [];
    setStores(userStores);

    const savedBrand = getSeoBrandSlug();
    const initialBrand =
      savedBrand && userStores.some((store) => store.slug === savedBrand)
        ? savedBrand
        : userStores[0]?.slug ?? "leovorno";
    setBrandSlug(initialBrand);
    setLoading(false);
  }, [router]);

  const selectedStore = useMemo(
    () => stores.find((store) => store.slug === brandSlug) ?? null,
    [stores, brandSlug],
  );

  const applyContentRows = useCallback(
    (rows: SeoContentRow[], page: string): void => {
      setContentRows(rows);
      const pageRows = rows.filter((row) => row.page === page);
      const nextDraft: Record<string, string> = {};
      for (const row of pageRows) {
        nextDraft[row.section] = row.content;
      }
      setDraft(nextDraft);

      const titleRow = pageRows.find((row) => row.section === "page_title");
      if (titleRow) {
        setMetaDraft({
          metaTitle: titleRow.metaTitle ?? "",
          metaDescription: titleRow.metaDescription ?? "",
          metaKeywords: titleRow.metaKeywords ?? "",
          ogImageUrl: titleRow.ogImageUrl ?? "",
          robotsIndex: titleRow.robotsIndex,
        });
      } else {
        setMetaDraft({
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
          ogImageUrl: "",
          robotsIndex: true,
        });
      }
    },
    [],
  );

  const loadContent = useCallback(async (): Promise<void> => {
    if (!token) return;
    let rows = await fetchSeoContentAdmin(token, brandSlug, null);

    // Fill any empty SEO fields from store settings so Pages always show current data.
    try {
      const filled = await fillSeoFromStore(token, brandSlug, null, false);
      await ensureStarterBlog(token, brandSlug, null);
      if (filled.updated > 0) {
        rows = await fetchSeoContentAdmin(token, brandSlug, null);
        setMessage("Loaded SEO from current store settings.");
      }
    } catch {
      // leave whatever we fetched; user can fill manually
    }

    applyContentRows(rows, pageFilter);
  }, [token, brandSlug, pageFilter, applyContentRows]);

  const loadImages = useCallback(async (): Promise<void> => {
    if (!token) return;
    const list = await fetchSeoImages(token, brandSlug, null);
    setImages(list);
    const verify = await verifySeoImages(token, brandSlug, null);
    setMissingImages(verify.missing);
  }, [token, brandSlug]);

  const loadPosts = useCallback(async (): Promise<void> => {
    if (!token) return;
    const list = await fetchBlogPosts(token, brandSlug, null);
    setPosts(list);
  }, [token, brandSlug]);

  const loadChecklist = useCallback(async (): Promise<void> => {
    if (!token) return;
    try {
      const next = await fetchSeoLaunchChecklist(token, brandSlug, null);
      setChecklist(next);
    } catch {
      setChecklist(null);
    }
  }, [token, brandSlug]);

  useEffect(() => {
    if (!token) return;
    if (tab === "pages") void loadContent();
    if (tab === "images") void loadImages();
    if (tab === "blog") void loadPosts();
    if (tab === "dashboard") void loadChecklist();
  }, [token, tab, loadContent, loadImages, loadPosts, loadChecklist]);

  useEffect(() => {
    if (!token || tab !== "pages") return;
    // Only re-apply draft for page filter change without re-fetching when rows already loaded
    if (contentRows.length > 0) {
      applyContentRows(contentRows, pageFilter);
    }
  }, [pageFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBrandChange = (slug: string): void => {
    setBrandSlug(slug);
    setSeoBrandSlug(slug);
    setMessage(null);
    setError(null);
  };

  const handleSavePages = async (): Promise<void> => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const sections = PAGE_SECTIONS[pageFilter] ?? [];
      const textItems = sections
        .filter((section) => section !== "page_title")
        .map((section) => ({
          page: pageFilter,
          section,
          content: draft[section] ?? "",
        }));

      const items: Array<{
        page: string;
        section: string;
        content?: string;
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string;
        ogImageUrl?: string;
        robotsIndex?: boolean;
      }> = [...textItems];

      if (sections.includes("page_title")) {
        items.push({
          page: pageFilter,
          section: "page_title",
          content: metaDraft.metaTitle,
          metaTitle: metaDraft.metaTitle,
          metaDescription: metaDraft.metaDescription,
          metaKeywords: metaDraft.metaKeywords,
          ogImageUrl: metaDraft.ogImageUrl,
          robotsIndex: metaDraft.robotsIndex,
        });
      }

      await bulkUpsertSeoContent(token, brandSlug, null, items);
      setMessage("Page content saved.");
      await loadContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File): Promise<void> => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await uploadSeoImage(token, brandSlug, file, null);
      setMessage("Image uploaded.");
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignImage = async (
    image: SeoImageRecord,
    slot: (typeof IMAGE_SLOTS)[number],
  ): Promise<void> => {
    if (!token) return;
    setSaving(true);
    try {
      await bulkUpsertSeoContent(token, brandSlug, null, [
        {
          page: slot.page,
          section: slot.section,
          content: image.filePath,
        },
      ]);
      setMessage(`Assigned to ${slot.label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assign failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePost = async (): Promise<void> => {
    if (!token || !editingPost?.title || !editingPost.slug) return;
    setSaving(true);
    setError(null);
    try {
      await saveBlogPost(token, brandSlug, {
        ...editingPost,
        domainId: null,
        title: editingPost.title,
        slug: editingPost.slug,
      });
      setEditingPost(null);
      setMessage("Blog post saved.");
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleFillFromStore = async (overwrite: boolean): Promise<void> => {
    if (!token) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const result = await fillSeoFromStore(token, brandSlug, null, overwrite);
      setMessage(
        overwrite
          ? `Overwrote SEO from store settings (${result.updated} fields).`
          : `Filled empty SEO fields from store (${result.updated} updated).`,
      );
      await loadContent();
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fill from store failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleStarterBlog = async (): Promise<void> => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const result = await ensureStarterBlog(token, brandSlug, null);
      setMessage(
        result.created
          ? "Starter blog draft created — edit and publish when ready."
          : "A blog post already exists for this store.",
      );
      setTab("blog");
      await loadPosts();
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create starter blog.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">SEO Dashboard</h1>
            <p className="text-sm text-zinc-400">
              {selectedStore ? storeOptionLabel(selectedStore) : brandSlug}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              onChange={(event) => handleBrandChange(event.target.value)}
              value={brandSlug}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.slug}>
                  {storeOptionLabel(store)}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                clearAuthSession();
                router.replace("/seo-login");
              }}
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {(
            [
              ["dashboard", "Dashboard", LayoutDashboard],
              ["pages", "Pages", FileText],
              ["images", "Images", ImageIcon],
              ["blog", "Blog", Newspaper],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                tab === key ? "bg-pink-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
              }`}
              key={key}
              onClick={() => setTab(key)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <main className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          {message ? <p className="mb-4 text-sm text-green-400">{message}</p> : null}
          {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

          {tab === "dashboard" ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">Launch checklist</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Editing{" "}
                  <strong className="text-white">
                    {selectedStore ? storeOptionLabel(selectedStore) : brandSlug}
                  </strong>
                  .
                </p>
              </div>

              {checklist ? (
                <div className="space-y-3 rounded-xl border border-zinc-800 p-4 text-sm">
                  <p>
                    Sitemap:{" "}
                    <a className="text-pink-400 underline" href={checklist.sitemapUrl} rel="noreferrer" target="_blank">
                      {checklist.sitemapUrl}
                    </a>
                  </p>
                  <p>
                    Robots:{" "}
                    <a className="text-pink-400 underline" href={checklist.robotsUrl} rel="noreferrer" target="_blank">
                      {checklist.robotsUrl}
                    </a>
                  </p>
                  <ul className="space-y-1 text-zinc-300">
                    <li>{checklist.hasAddress ? "✓" : "○"} Store address set</li>
                    <li>{checklist.hasPhone ? "✓" : "○"} Store phone set</li>
                    <li>
                      {checklist.hasVerification ? "✓" : "○"} Google site verification token
                      {checklist.googleSiteVerification
                        ? ` (${checklist.googleSiteVerification.slice(0, 12)}…)`
                        : " — set in Admin → System Settings"}
                    </li>
                    <li>
                      {checklist.seoContentCount > 0 ? "✓" : "○"} SEO content rows ({checklist.seoContentCount})
                    </li>
                    <li>
                      {checklist.blogPostCount > 0 ? "✓" : "○"} Blog posts ({checklist.blogPostCount})
                    </li>
                  </ul>
                  <ol className="list-decimal space-y-1 pl-5 text-zinc-400">
                    {checklist.gscSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button disabled={saving} onClick={() => void handleFillFromStore(false)} variant="outline">
                  Fill empty SEO from store
                </Button>
                <Button disabled={saving} onClick={() => void handleFillFromStore(true)} variant="outline">
                  Overwrite SEO from store
                </Button>
                <Button disabled={saving} onClick={() => void handleStarterBlog()}>
                  Create starter blog draft
                </Button>
              </div>

              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
                <li>Use Pages to edit hero text and meta tags per page.</li>
                <li>Use Images to upload and assign hero backgrounds.</li>
                <li>Use Blog for posts (meta, thumbnail, author, category).</li>
                <li>Each custom domain needs its own Google Search Console property + that host&apos;s sitemap.xml.</li>
                <li>SEO is per store (not per domain override).</li>
              </ul>
            </div>
          ) : null}

          {tab === "pages" ? (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {SEO_PAGES.map((page) => (
                  <button
                    className={`rounded-full px-3 py-1 text-sm ${
                      pageFilter === page ? "bg-pink-600" : "bg-zinc-800 text-zinc-300"
                    }`}
                    key={page}
                    onClick={() => setPageFilter(page)}
                    type="button"
                  >
                    {page}
                  </button>
                ))}
              </div>

              {(PAGE_SECTIONS[pageFilter] ?? [])
                .filter((section) => !["page_title", "hero_image"].includes(section))
                .map((section) => (
                  <div key={section}>
                    <label className="mb-1 block text-sm capitalize text-zinc-300">
                      {section.replace(/_/g, " ")}
                    </label>
                    {section === "hero_body" ? (
                      <textarea
                        className="min-h-[100px] w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm"
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, [section]: event.target.value }))
                        }
                        value={draft[section] ?? ""}
                      />
                    ) : (
                      <Input
                        className="border-zinc-700 bg-zinc-800"
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, [section]: event.target.value }))
                        }
                        value={draft[section] ?? ""}
                      />
                    )}
                  </div>
                ))}

              {PAGE_SECTIONS[pageFilter]?.includes("page_title") ? (
                <div className="space-y-3 rounded-xl border border-zinc-800 p-4">
                  <h3 className="font-medium">Meta tags</h3>
                  <div>
                    <label className="text-sm text-zinc-400">
                      Title ({metaDraft.metaTitle.length}/60)
                    </label>
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setMetaDraft((prev) => ({ ...prev, metaTitle: event.target.value }))
                      }
                      value={metaDraft.metaTitle}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">
                      Description ({metaDraft.metaDescription.length}/160)
                    </label>
                    <textarea
                      className="min-h-[80px] w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm"
                      onChange={(event) =>
                        setMetaDraft((prev) => ({
                          ...prev,
                          metaDescription: event.target.value,
                        }))
                      }
                      value={metaDraft.metaDescription}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">Keywords</label>
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setMetaDraft((prev) => ({ ...prev, metaKeywords: event.target.value }))
                      }
                      value={metaDraft.metaKeywords}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400">OG image URL</label>
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setMetaDraft((prev) => ({ ...prev, ogImageUrl: event.target.value }))
                      }
                      value={metaDraft.ogImageUrl}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      checked={metaDraft.robotsIndex}
                      onChange={(event) =>
                        setMetaDraft((prev) => ({ ...prev, robotsIndex: event.target.checked }))
                      }
                      type="checkbox"
                    />
                    Allow search engines to index this page
                  </label>
                </div>
              ) : null}

              <Button disabled={saving} onClick={() => void handleSavePages()}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save page
              </Button>
              <Button
                className="ml-2"
                disabled={saving}
                onClick={() => void handleFillFromStore(false)}
                variant="outline"
              >
                Fill empty from store
              </Button>
            </div>
          ) : null}

          {tab === "images" ? (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm">Upload image (max 5MB)</label>
                <input
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleUpload(file);
                  }}
                  type="file"
                />
              </div>

              {missingImages.length > 0 ? (
                <p className="text-sm text-amber-400">
                  {missingImages.length} image(s) missing from disk.
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((image) => (
                  <div className="rounded-xl border border-zinc-800 p-3" key={image.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={image.altText ?? image.label ?? "SEO image"}
                      className="mb-2 h-32 w-full rounded-lg object-cover"
                      src={resolveMediaUrl(image.filePath) ?? image.filePath}
                    />
                    <p className="truncate text-xs text-zinc-400">{image.filename}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {IMAGE_SLOTS.map((slot) => (
                        <button
                          className="rounded bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700"
                          key={`${slot.page}-${slot.section}`}
                          onClick={() => void handleAssignImage(image, slot)}
                          type="button"
                        >
                          {slot.page}
                        </button>
                      ))}
                      <button
                        className="rounded bg-red-900/50 px-2 py-1 text-xs hover:bg-red-900"
                        onClick={async () => {
                          if (!token) return;
                          await deleteSeoImage(token, image.id, brandSlug);
                          await loadImages();
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "blog" ? (
            <div className="space-y-6">
              {!editingPost ? (
                <>
                  <Button
                    onClick={() =>
                      setEditingPost({
                        title: "",
                        slug: "",
                        content: "",
                        status: "DRAFT",
                        excerpt: "",
                      })
                    }
                  >
                    New post
                  </Button>
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
                        key={post.id}
                      >
                        <div>
                          <p className="font-medium">{post.title}</p>
                          <p className="text-xs text-zinc-400">
                            /{post.slug} · {post.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => setEditingPost(post)} variant="outline">
                            Edit
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!token) return;
                              await deleteBlogPost(token, post.id, brandSlug);
                              await loadPosts();
                            }}
                            variant="outline"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <Input
                    className="border-zinc-700 bg-zinc-800"
                    onChange={(event) =>
                      setEditingPost((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Title"
                    value={editingPost.title ?? ""}
                  />
                  <Input
                    className="border-zinc-700 bg-zinc-800"
                    onChange={(event) =>
                      setEditingPost((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    placeholder="slug"
                    value={editingPost.slug ?? ""}
                  />
                  <textarea
                    className="min-h-[80px] w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm"
                    onChange={(event) =>
                      setEditingPost((prev) => ({ ...prev, excerpt: event.target.value }))
                    }
                    placeholder="Excerpt"
                    value={editingPost.excerpt ?? ""}
                  />
                  <RichTextEditor
                    onChange={(content) =>
                      setEditingPost((prev) => ({ ...prev, content }))
                    }
                    value={editingPost.content ?? ""}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setEditingPost((prev) => ({ ...prev, author: event.target.value }))
                      }
                      placeholder="Author"
                      value={editingPost.author ?? ""}
                    />
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setEditingPost((prev) => ({ ...prev, category: event.target.value }))
                      }
                      placeholder="Category"
                      value={editingPost.category ?? ""}
                    />
                  </div>
                  <div className="space-y-3 rounded-xl border border-zinc-800 p-4">
                    <h3 className="font-medium">Post SEO</h3>
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setEditingPost((prev) => ({ ...prev, metaTitle: event.target.value }))
                      }
                      placeholder="Meta title"
                      value={editingPost.metaTitle ?? ""}
                    />
                    <textarea
                      className="min-h-[70px] w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-sm"
                      onChange={(event) =>
                        setEditingPost((prev) => ({
                          ...prev,
                          metaDescription: event.target.value,
                        }))
                      }
                      placeholder="Meta description"
                      value={editingPost.metaDescription ?? ""}
                    />
                    <Input
                      className="border-zinc-700 bg-zinc-800"
                      onChange={(event) =>
                        setEditingPost((prev) => ({ ...prev, metaKeywords: event.target.value }))
                      }
                      placeholder="Meta keywords"
                      value={editingPost.metaKeywords ?? ""}
                    />
                    <div>
                      <label className="mb-1 block text-sm text-zinc-400">Thumbnail</label>
                      <select
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                        onChange={(event) =>
                          setEditingPost((prev) => ({
                            ...prev,
                            thumbnailImageId: event.target.value || null,
                          }))
                        }
                        onFocus={() => {
                          if (token && images.length === 0) void loadImages();
                        }}
                        value={editingPost.thumbnailImageId ?? ""}
                      >
                        <option value="">No thumbnail</option>
                        {images.map((image) => (
                          <option key={image.id} value={image.id}>
                            {image.label || image.filename}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-zinc-500">
                        Upload images in the Images tab first, then select here.
                      </p>
                    </div>
                  </div>
                  <select
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
                    onChange={(event) =>
                      setEditingPost((prev) => ({
                        ...prev,
                        status: event.target.value as "DRAFT" | "PUBLISHED",
                      }))
                    }
                    value={editingPost.status ?? "DRAFT"}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                  <div className="flex gap-2">
                    <Button disabled={saving} onClick={() => void handleSavePost()}>
                      Save post
                    </Button>
                    <Button onClick={() => setEditingPost(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
