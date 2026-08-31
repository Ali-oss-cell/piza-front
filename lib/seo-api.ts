import { apiRequest } from "@/lib/api-client";

export interface SeoContentRow {
  id: string;
  storeId: string;
  domainId: string | null;
  page: string;
  section: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImageUrl: string | null;
  robotsIndex: boolean;
}

export interface SeoContentResponse {
  sections: Record<string, string>;
  meta: {
    title?: string;
    description?: string;
    keywords?: string;
    ogImageUrl?: string;
    robotsIndex: boolean;
  };
  rows: SeoContentRow[];
}

export interface SeoImageRecord {
  id: string;
  storeId: string;
  domainId: string | null;
  filename: string;
  filePath: string;
  label: string | null;
  page: string | null;
  section: string | null;
  altText: string | null;
  createdAt: string;
  usage?: string[];
}

export interface SeoRedirectRecord {
  id: string;
  storeId: string;
  fromPath: string;
  toPath: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeoDomain {
  id: string;
  storeId: string;
  host: string | null;
  pathPrefix: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export interface BlogPostRecord {
  id: string;
  storeId: string;
  domainId: string | null;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  author: string | null;
  publishedAt: string | null;
  thumbnailImageId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  category: string | null;
  thumbnail?: SeoImageRecord | null;
}

function withDomainQuery(path: string, domainId: string | null): string {
  if (domainId === null) {
    return `${path}${path.includes("?") ? "&" : "?"}domainId=null`;
  }
  if (domainId) {
    return `${path}${path.includes("?") ? "&" : "?"}domainId=${encodeURIComponent(domainId)}`;
  }
  return path;
}

export function fetchSeoContentAdmin(
  token: string,
  brandSlug: string,
  domainId: string | null,
): Promise<SeoContentRow[]> {
  return apiRequest<SeoContentRow[]>(
    withDomainQuery("/seo/content/admin", domainId),
    { token, brandSlug },
  );
}

export function fetchPublicSeoContent(
  brandSlug: string,
  page: string,
  domainId?: string | null,
): Promise<SeoContentResponse> {
  const params = new URLSearchParams({ brand: brandSlug, page });
  if (domainId) {
    params.set("domainId", domainId);
  }
  return apiRequest<SeoContentResponse>(`/seo/content?${params.toString()}`);
}

export function updateSeoContent(
  token: string,
  id: string,
  payload: Partial<SeoContentRow>,
  brandSlug: string,
): Promise<SeoContentRow> {
  return apiRequest<SeoContentRow>(`/seo/content/${id}`, {
    method: "PATCH",
    token,
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function bulkUpsertSeoContent(
  token: string,
  brandSlug: string,
  domainId: string | null,
  items: Array<{
    page: string;
    section: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImageUrl?: string;
    robotsIndex?: boolean;
  }>,
): Promise<SeoContentRow[]> {
  return apiRequest<SeoContentRow[]>("/seo/content/bulk", {
    method: "POST",
    token,
    brandSlug,
    body: JSON.stringify({ domainId, items }),
  });
}

export function fetchSeoDomains(
  token: string,
  brandSlug: string,
): Promise<SeoDomain[]> {
  return apiRequest<SeoDomain[]>("/seo/domains", { token, brandSlug });
}

export function fetchSeoImages(
  token: string,
  brandSlug: string,
  domainId: string | null,
): Promise<SeoImageRecord[]> {
  return apiRequest<SeoImageRecord[]>(
    withDomainQuery("/seo/images", domainId),
    { token, brandSlug },
  );
}

export async function uploadSeoImage(
  token: string,
  brandSlug: string,
  file: File,
  domainId: string | null,
  meta?: { label?: string; page?: string; section?: string; altText?: string },
): Promise<{ id: string; url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const params = new URLSearchParams();
  if (domainId === null) {
    params.set("domainId", "null");
  } else if (domainId) {
    params.set("domainId", domainId);
  }
  if (meta?.label) params.set("label", meta.label);
  if (meta?.page) params.set("page", meta.page);
  if (meta?.section) params.set("section", meta.section);
  if (meta?.altText) params.set("altText", meta.altText);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  const query = params.toString();
  const url = `${API_BASE}/uploads/seo${query ? `?${query}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Brand-Slug": brandSlug,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string | string[];
    };
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : body.message ?? "Upload failed";
    throw new Error(message);
  }

  return response.json() as Promise<{ id: string; url: string; filename: string }>;
}

export function deleteSeoImage(
  token: string,
  id: string,
  brandSlug: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/seo/images/${id}`, {
    method: "DELETE",
    token,
    brandSlug,
  });
}

export function updateSeoImage(
  token: string,
  brandSlug: string,
  id: string,
  payload: {
    label?: string | null;
    altText?: string | null;
    page?: string | null;
    section?: string | null;
  },
): Promise<SeoImageRecord> {
  return apiRequest<SeoImageRecord>(`/seo/images/${id}`, {
    method: "PATCH",
    token,
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function fetchSeoRedirects(
  token: string,
  brandSlug: string,
): Promise<SeoRedirectRecord[]> {
  return apiRequest<SeoRedirectRecord[]>("/seo/redirects", {
    token,
    brandSlug,
  });
}

export function saveSeoRedirect(
  token: string,
  brandSlug: string,
  payload: {
    id?: string;
    fromPath: string;
    toPath: string;
    isActive?: boolean;
  },
): Promise<SeoRedirectRecord> {
  return apiRequest<SeoRedirectRecord>("/seo/redirects", {
    method: "POST",
    token,
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function deleteSeoRedirect(
  token: string,
  brandSlug: string,
  id: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/seo/redirects/${id}`, {
    method: "DELETE",
    token,
    brandSlug,
  });
}

export function updateSeoGscSettings(
  token: string,
  brandSlug: string,
  payload: {
    googleSiteVerification?: string | null;
    sitemapSubmitted?: boolean;
  },
): Promise<{
  slug: string;
  googleSiteVerification: string | null;
  sitemapSubmittedAt: string | null;
}> {
  return apiRequest("/seo/gsc-settings", {
    method: "PATCH",
    token,
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function verifySeoImages(
  token: string,
  brandSlug: string,
  domainId: string | null,
): Promise<{ missing: SeoImageRecord[]; total: number }> {
  return apiRequest<{ missing: SeoImageRecord[]; total: number }>(
    withDomainQuery("/seo/images/verify", domainId),
    { token, brandSlug },
  );
}

export function fetchBlogPosts(
  token: string | undefined,
  brandSlug: string,
  domainId?: string | null,
  host?: string,
): Promise<BlogPostRecord[]> {
  const params = new URLSearchParams({ brand: brandSlug });
  if (domainId) params.set("domainId", domainId);
  if (host) params.set("host", host);
  return apiRequest<BlogPostRecord[]>(`/seo/blog?${params.toString()}`, {
    token,
    brandSlug,
  });
}

export function fetchBlogPost(
  slug: string,
  brandSlug: string,
  domainId?: string | null,
  token?: string,
  host?: string,
): Promise<BlogPostRecord> {
  const params = new URLSearchParams({ brand: brandSlug });
  if (domainId) params.set("domainId", domainId);
  if (host) params.set("host", host);
  return apiRequest<BlogPostRecord>(`/seo/blog/${slug}?${params.toString()}`, {
    token,
    brandSlug,
  });
}

export function fillSeoFromStore(
  token: string,
  brandSlug: string,
  domainId: string | null,
  overwrite = false,
): Promise<{ updated: number }> {
  return apiRequest("/seo/fill-from-store", {
    method: "POST",
    token,
    brandSlug,
    body: JSON.stringify({ domainId, overwrite }),
  });
}

export function ensureStarterBlog(
  token: string,
  brandSlug: string,
  domainId: string | null,
): Promise<{ created: boolean; post: BlogPostRecord }> {
  return apiRequest("/seo/starter-blog", {
    method: "POST",
    token,
    brandSlug,
    body: JSON.stringify({ domainId }),
  });
}

export function fetchSeoLaunchChecklist(
  token: string,
  brandSlug: string,
  domainId: string | null,
): Promise<{
  brandSlug: string;
  storeName: string;
  googleSiteVerification: string | null;
  hasVerification: boolean;
  sitemapSubmittedAt: string | null;
  sitemapSubmitted: boolean;
  hasAddress: boolean;
  hasPhone: boolean;
  seoContentCount: number;
  blogPostCount: number;
  sitemapUrl: string;
  robotsUrl: string;
  publicHomeUrl: string;
  gscSteps: string[];
  domain: { id: string; host: string | null; pathPrefix: string | null } | null;
}> {
  return apiRequest(withDomainQuery("/seo/launch-checklist", domainId), {
    token,
    brandSlug,
  });
}

export function saveBlogPost(
  token: string,
  brandSlug: string,
  payload: Partial<BlogPostRecord> & { title: string; slug: string },
): Promise<BlogPostRecord> {
  return apiRequest<BlogPostRecord>("/seo/blog", {
    method: "POST",
    token,
    brandSlug,
    body: JSON.stringify(payload),
  });
}

export function deleteBlogPost(
  token: string,
  id: string,
  brandSlug: string,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/seo/blog/${id}`, {
    method: "DELETE",
    token,
    brandSlug,
  });
}

export const SEO_PAGES = [
  "home",
  "menu",
  "about",
  "deals",
  "locations",
  "blog",
  "catering",
  "faq",
  "contact",
  "delivery",
  "privacy",
  "terms",
  "allergens",
  "gallery",
  "reviews",
  "gift-cards",
  "loyalty",
  "careers",
  "functions",
  "nutrition",
] as const;

export const IMAGE_SLOTS = [
  { page: "home", section: "hero_image", label: "Home – Hero background" },
  { page: "menu", section: "hero_image", label: "Menu – Hero background" },
  { page: "about", section: "hero_image", label: "About – Hero background" },
  { page: "deals", section: "hero_image", label: "Deals – Hero background" },
  { page: "locations", section: "hero_image", label: "Locations – Hero background" },
  { page: "blog", section: "hero_image", label: "Blog – Hero background" },
  { page: "catering", section: "hero_image", label: "Catering – Hero background" },
  { page: "faq", section: "hero_image", label: "FAQ – Hero background" },
  { page: "contact", section: "hero_image", label: "Contact – Hero background" },
  { page: "delivery", section: "hero_image", label: "Delivery – Hero background" },
  { page: "gallery", section: "hero_image", label: "Gallery – Hero background" },
] as const;
