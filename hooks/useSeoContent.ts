"use client";

import { useEffect, useState } from "react";
import { fetchPublicSeoContent, type SeoContentResponse } from "@/lib/seo-api";
import { getSiteBrandSlug } from "@/lib/brand-storage";

interface UseSeoContentResult {
  sections: Record<string, string>;
  meta: SeoContentResponse["meta"];
  loading: boolean;
  error: string | null;
}

export function useSeoContent(
  pageKey: string,
  brandSlug?: string,
  domainId?: string | null,
): UseSeoContentResult {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [meta, setMeta] = useState<SeoContentResponse["meta"]>({ robotsIndex: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const slug = brandSlug ?? getSiteBrandSlug() ?? "benny-boys";

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicSeoContent(slug, pageKey, domainId);
        if (!cancelled) {
          setSections(data.sections);
          setMeta(data.meta);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load content");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pageKey, brandSlug, domainId]);

  return { sections, meta, loading, error };
}
