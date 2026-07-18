"use client";

import { resolveMediaUrl, storeMonogram } from "@/lib/media-url";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  brandName: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string | null;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
}

/**
 * Renders light + dark logos with CSS theme switching (no hydration flash).
 * Falls back to the other logo if only one is set, then to text.
 */
export function BrandLogo({
  brandName,
  logoUrl,
  logoDarkUrl,
  primaryColor = "#D81B60",
  className,
  imageClassName,
  textClassName,
}: BrandLogoProps): React.ReactElement {
  const lightSrc = resolveMediaUrl(logoUrl) ?? resolveMediaUrl(logoDarkUrl);
  const darkSrc = resolveMediaUrl(logoDarkUrl) ?? resolveMediaUrl(logoUrl);

  if (!lightSrc && !darkSrc) {
    return (
      <span className={cn(textClassName)} style={{ color: undefined }}>
        {brandName}
      </span>
    );
  }

  if (lightSrc && darkSrc && lightSrc !== darkSrc) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={brandName}
          className={cn("block object-contain dark:hidden", imageClassName)}
          src={lightSrc}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={brandName}
          className={cn("hidden object-contain dark:block", imageClassName)}
          src={darkSrc}
        />
      </span>
    );
  }

  const src = lightSrc ?? darkSrc!;
  return (
    <span className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt={brandName} className={cn("object-contain", imageClassName)} src={src} />
    </span>
  );
}

export function BrandLogoMark({
  brandName,
  logoUrl,
  logoDarkUrl,
  primaryColor = "#D81B60",
  className,
}: {
  brandName: string;
  logoUrl?: string | null;
  logoDarkUrl?: string | null;
  primaryColor?: string | null;
  className?: string;
}): React.ReactElement {
  const lightSrc = resolveMediaUrl(logoUrl) ?? resolveMediaUrl(logoDarkUrl);
  const darkSrc = resolveMediaUrl(logoDarkUrl) ?? resolveMediaUrl(logoUrl);

  if (!lightSrc && !darkSrc) {
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl font-display font-bold text-white",
          className,
        )}
        style={{ backgroundColor: primaryColor ?? "#D81B60" }}
      >
        {storeMonogram(brandName)}
      </span>
    );
  }

  if (lightSrc && darkSrc && lightSrc !== darkSrc) {
    return (
      <span className={cn("relative inline-flex", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="h-full w-full object-contain dark:hidden" src={lightSrc} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="hidden h-full w-full object-contain dark:block" src={darkSrc} />
      </span>
    );
  }

  const src = lightSrc ?? darkSrc!;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" className={cn("object-contain", className)} src={src} />
  );
}
