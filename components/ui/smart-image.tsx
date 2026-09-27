"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { blurHashToDataUrl } from "@/lib/blur-hash";
import { cn } from "@/lib/utils";

type SmartImageProps = Omit<ImageProps, "onLoad"> & {
  blurHash?: string | null;
  /** Extra class for the outer frame */
  frameClassName?: string;
};

/**
 * next/image with BlurHash color placeholder while the full asset loads.
 * Falls back to a soft shimmer when no hash is available.
 */
export function SmartImage({
  blurHash,
  className,
  frameClassName,
  alt,
  ...imageProps
}: SmartImageProps): React.ReactElement {
  const [loaded, setLoaded] = useState(false);
  const placeholder = useMemo(
    () => (blurHash ? blurHashToDataUrl(blurHash) : null),
    [blurHash]
  );

  useEffect(() => {
    setLoaded(false);
  }, [imageProps.src]);

  return (
    <span className={cn("relative block overflow-hidden", frameClassName)}>
      {placeholder && !loaded ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
          src={placeholder}
        />
      ) : null}
      {!placeholder && !loaded ? (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800"
        />
      ) : null}
      <Image
        alt={alt}
        className={cn(
          "transition-opacity duration-500 ease-out",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        {...imageProps}
      />
    </span>
  );
}
