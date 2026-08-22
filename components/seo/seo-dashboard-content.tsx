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
  fetchBlogPosts,
  fetchSeoContentAdmin,
  fetchSeoDomains,
  fetchSeoImages,
  IMAGE_SLOTS,
  saveBlogPost,
  SEO_PAGES,
  uploadSeoImage,
  verifySeoImages,
  type BlogPostRecord,
  type SeoContentRow,
  type SeoDomain,
  type SeoImageRecord,
} from "@/lib/seo-api";
import { getSeoBrandSlug, getSeoDomainId, setSeoBrandSlug, setSeoDomainId } from "@/lib/seo-storage";
import { canAccessSeoDashboard, type AuthStore } from "@/types/auth";

type Tab = "dashboard" | "pages" | "images" | "blog";

const PAGE_SECTIONS: Record<string, string[]> = {
  home: ["hero_h1", "hero_h2", "hero_body", "hero_image", "page_title"],
  about: ["hero_h1", "hero_body", "hero_image", "page_title"],
  deals: ["hero_h1", "hero_body", "hero_image", "page_title"],
  locations: ["hero_h1", "hero_body", "hero_image", "page_title"],
  blog: ["hero_h1", "hero_body", "hero_image"],
};

function domainLabel(domain: SeoDomain): string {
  if (domain.host) return domain.host;
  if (domain.pathPrefix) return domain.pathPrefix;
  return domain.id.slice(0, 8);
}

export function SeoDashboardContent(): React.ReactElement {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [token, setToken] = useState<string | null>(null);
  const [stores, setStores] = useState<AuthStore[]>([]);
  const [brandSlug, setBrandSlug] = useState<string>("leovorno");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [domains, setDomains] = useState<SeoDomain[]>([]);
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

    const savedDomain = getSeoDomainId();
    setDomainId(savedDomain);
    setLoading(false);
  }, [router]);

  const loadDomains = useCallback(async () => {
    if (!token) return;
    const list = await fetchSeoDomains(token, brandSlug);
    setDomains(list);
  }, [token, brandSlug]);

  const loadContent = useCallback(async () => {
    if (!token) return;
    const rows = await fetchSeoContentAdmin(token, brandSlug, domainId);
    setContentRows(rows);

    const pageRows = rows.filter((row) => row.page === pageFilter);
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
  }, [token, brandSlug, domainId, pageFilter]);

  const loadImages = useCallback(async () => {
    if (!token) return;
    const list = await fetchSeoImages(token, brandSlug, domainId);
    setImages(list);
    const verify = await verifySeoImages(token, brandSlug, domainId);
    setMissingImages(verify.missing);
  }, [token, brandSlug, domainId]);

  const loadPosts = useCallback(async () => {
    if (!token) return;
    const list = await fetchBlogPosts(token, brandSlug, domainId);
    setPosts(list);
  }, [token, brandSlug, domainId]);

  useEffect(() => {
    if (!token) return;
    void loadDomains();
  }, [token, loadDomains]);

  useEffect(() => {
    if (!token) return;
    if (tab === "pages") void loadContent();
    if (tab === "images") void loadImages();
    if (tab === "blog") void loadPosts();
  }, [token, tab, loadContent, loadImages, loadPosts]);

  useEffect(() => {
    if (!token || tab !== "pages") return;
    void loadContent();
  }, [pageFilter, token, tab, loadContent]);

  const handleBrandChange = (slug: string): void => {
    setBrandSlug(slug);
    setSeoBrandSlug(slug);
    setDomainId(null);
    setSeoDomainId(null);
  };

  const handleDomainChange = (value: string): void => {
    const next = value === "default" ? null : value;
    setDomainId(next);
    setSeoDomainId(next);
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

      await bulkUpsertSeoContent(token, brandSlug, domainId, items);
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
      await uploadSeoImage(token, brandSlug, file, domainId);
      setMessage("Image uploaded.");
      await loadImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignImage = async (image: SeoImageRecord, slot: (typeof IMAGE_SLOTS)[number]): Promise<void> => {
    if (!token) return;
    setSaving(true);
    try {
      await bulkUpsertSeoContent(token, brandSlug, domainId, [
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
        domainId,
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

  const scopeLabel = useMemo(() => {
    if (!domainId) return "Store default (all domains)";
    const domain = domains.find((item) => item.id === domainId);
    return domain ? domainLabel(domain) : domainId;
  }, [domainId, domains]);

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
            <p className="text-sm text-zinc-400">{scopeLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              onChange={(event) => handleBrandChange(event.target.value)}
              value={brandSlug}
            >
              {stores.map((store) => (
                <option key={store.id} value={store.slug}>
                  {store.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
              onChange={(event) => handleDomainChange(event.target.value)}
              value={domainId ?? "default"}
            >
              <option value="default">Store default (all domains)</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domainLabel(domain)}
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
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Session overview</h2>
              <p className="text-sm text-zinc-400">
                Editing <strong className="text-white">{brandSlug}</strong> — {scopeLabel}.
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
                <li>Use Pages to edit hero text and meta tags per page.</li>
                <li>Use Images to upload and assign hero backgrounds.</li>
                <li>Use Blog to create and publish posts with the rich editor.</li>
                <li>Domain overrides replace store defaults for that host/path only.</li>
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
