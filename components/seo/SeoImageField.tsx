"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/media-url";
import type { SeoImageRecord } from "@/lib/seo-api";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface SeoImageFieldProps {
  label?: string;
  valueId: string | null | undefined;
  images: SeoImageRecord[];
  disabled?: boolean;
  onUpload: (file: File) => Promise<SeoImageRecord | { id: string; url: string }>;
  onChange: (imageId: string | null) => void;
}

export function SeoImageField({
  label = "Thumbnail",
  valueId,
  images,
  disabled = false,
  onUpload,
  onChange,
}: SeoImageFieldProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const selected = images.find((image) => image.id === valueId) ?? null;

  const previewUrl =
    (selected?.filePath ? resolveMediaUrl(selected.filePath) : null) ??
    localPreview;

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use JPEG, PNG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const result = await onUpload(file);
      const url =
        "url" in result && result.url
          ? resolveMediaUrl(result.url) ?? result.url
          : "filePath" in result && result.filePath
            ? resolveMediaUrl(result.filePath)
            : null;
      setLocalPreview(url);
      onChange(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200/70 p-4 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={cn("text-sm font-medium", primaryText)}>{label}</label>
        <div className="flex flex-wrap gap-2">
          <input
            accept={ACCEPT}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(event) => void handleFile(event.target.files?.[0])}
            ref={inputRef}
            type="file"
          />
          <Button
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            type="button"
            variant="outline"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}
            {valueId ? "Replace image" : "Upload image"}
          </Button>
          {valueId ? (
            <Button
              disabled={disabled || uploading}
              onClick={() => {
                setLocalPreview(null);
                onChange(null);
              }}
              type="button"
              variant="outline"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={selected?.label || selected?.filename || "Selected image"}
          className="h-40 w-full max-w-sm rounded-lg border border-zinc-200/70 object-cover dark:border-white/10"
          src={previewUrl}
        />
      ) : (
        <div
          className={cn(
            "flex h-40 max-w-sm items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm dark:border-zinc-700",
            secondaryText,
          )}
        >
          No image selected
        </div>
      )}

      {images.length > 0 ? (
        <div>
          <label className={cn("mb-1 block text-xs", secondaryText)}>
            Or pick from library
          </label>
          <select
            className="w-full rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
            disabled={disabled || uploading}
            onChange={(event) => {
              setLocalPreview(null);
              onChange(event.target.value || null);
            }}
            value={valueId ?? ""}
          >
            <option value="">No thumbnail</option>
            {images.map((image) => (
              <option key={image.id} value={image.id}>
                {image.label || image.filename}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className={cn("text-xs", secondaryText)}>
          Upload an image above, or add more later in the Images tab.
        </p>
      )}

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
