"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { uploadLogo } from "@/lib/admin-api";
import { resolveMediaUrl, storeMonogram } from "@/lib/media-url";
import { secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface LogoUploaderProps {
  token: string;
  value: string;
  storeName?: string;
  primaryColor?: string;
  onChange: (logoUrl: string) => void;
  className?: string;
}

export function LogoUploader({
  token,
  value,
  storeName = "Store",
  primaryColor = "#D81B60",
  onChange,
  className,
}: LogoUploaderProps): React.ReactElement {
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
      const result = await uploadLogo(token, file);
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
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900"
          style={!preview ? { backgroundColor: `${primaryColor}22` } : undefined}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`${storeName} logo`} className="h-full w-full object-contain p-2" src={preview} />
          ) : (
            <span className="font-display text-2xl font-bold" style={{ color: primaryColor }}>
              {storeMonogram(storeName)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
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
            {isUploading ? "Uploading…" : value ? "Replace logo" : "Upload logo"}
          </button>
          <p className={cn("text-xs", secondaryText)}>
            JPEG, PNG, WebP or GIF · max 2&nbsp;MB
          </p>
          {value ? (
            <button
              className="text-xs text-[#d81b60] underline-offset-2 hover:underline"
              onClick={() => onChange("")}
              type="button"
            >
              Remove logo
            </button>
          ) : null}
        </div>
      </div>

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
