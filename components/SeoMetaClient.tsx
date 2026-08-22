"use client";

import { useEffect } from "react";
import { useSeoContent } from "@/hooks/useSeoContent";

interface SeoMetaClientProps {
  pageKey: string;
  brandSlug?: string;
  fallbackTitle?: string;
}

export default function SeoMetaClient({
  pageKey,
  brandSlug,
  fallbackTitle,
}: SeoMetaClientProps): null {
  const { meta } = useSeoContent(pageKey, brandSlug);

  useEffect(() => {
    const title = meta.title || fallbackTitle;
    if (title) {
      document.title = title;
    }

    const description = meta.description;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [meta.title, meta.description, fallbackTitle]);

  return null;
}
