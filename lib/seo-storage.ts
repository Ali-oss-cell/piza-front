const SEO_BRAND_KEY = "marina-seo-brand";
const SEO_DOMAIN_KEY = "marina-seo-domain";

export function getSeoBrandSlug(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SEO_BRAND_KEY);
}

export function setSeoBrandSlug(slug: string): void {
  window.localStorage.setItem(SEO_BRAND_KEY, slug);
}

export function getSeoDomainId(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(SEO_DOMAIN_KEY);
  if (!value || value === "null") return null;
  return value;
}

export function setSeoDomainId(domainId: string | null): void {
  window.localStorage.setItem(SEO_DOMAIN_KEY, domainId ?? "null");
}
