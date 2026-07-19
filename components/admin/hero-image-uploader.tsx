"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadHeroImage } from "@/lib/admin-api";
import { resolveMediaUrl } from "@/lib/media-url";
import { secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface HeroImageUploaderProps {
  token: string;
  value: string;
  onChange: (heroImageUrl: string) => void;
  className?: string;
}

export function HeroImageUploader({
  token,
  value,
  onChange,
  className,
}: HeroImageUploaderProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = resolveMediaUrl(value);

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadHeroImage(token, file);
      onChange(result.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative flex aspect-[16/7] w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/70 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Homepage hero" className="h-full w-full object-cover" src={preview} />
        ) : (
          <span className={cn("text-sm", secondaryText)}>No hero image yet</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium transition hover:border-[#d81b60]/40 dark:border-white/10 dark:bg-zinc-900"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#d81b60]" />
          ) : (
            <ImagePlus className="h-4 w-4 text-[#d81b60]" />
          )}
          {isUploading ? "Uploading…" : value ? "Replace hero image" : "Upload hero image"}
        </button>
        {value ? (
          <button
            className="text-xs text-[#d81b60] underline-offset-2 hover:underline"
            onClick={() => onChange("")}
            type="button"
          >
            Remove
          </button>
        ) : null}
      </div>
      <p className={cn("text-xs", secondaryText)}>
        Wide banner for the storefront homepage · JPEG, PNG, WebP or GIF · max 5&nbsp;MB
      </p>

      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        ref={inputRef}
        type="file"
      />

      {error ? <p className="text-sm text-[#d81b60]">{error}</p> : null}
    </div>
  );
}
