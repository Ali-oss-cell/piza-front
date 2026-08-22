"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IAllProps } from "@tinymce/tinymce-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  height?: number;
  label?: string;
  /** Upload a blob and return a public URL for insertion into the editor. */
  onImageUpload?: (file: File) => Promise<string>;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 420,
  label,
  onImageUpload,
}: RichTextEditorProps): React.ReactElement {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [EditorComponent, setEditorComponent] = useState<
    React.ComponentType<IAllProps> | null
  >(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const onImageUploadRef = useRef(onImageUpload);
  onImageUploadRef.current = onImageUpload;

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    setEditorComponent(null);

    async function loadEditor() {
      try {
        const mod = await import("@tinymce/tinymce-react");
        if (!cancelled) {
          setEditorComponent(() => mod.Editor);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Could not load TinyMCE.",
          );
        }
      }
    }

    void loadEditor();
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const handleBlobUpload = useCallback(async (blobInfo: {
    blob: () => Blob;
    filename: () => string;
  }): Promise<string> => {
    const upload = onImageUploadRef.current;
    if (!upload) {
      throw new Error("Image upload is not configured.");
    }
    const blob = blobInfo.blob();
    const name = blobInfo.filename() || "image.png";
    const file = new File([blob], name, {
      type: blob.type || "image/png",
    });
    return upload(file);
  }, []);

  if (loadError) {
    return (
      <div className="space-y-2">
        {label ? (
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {label}
          </label>
        ) : null}
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="font-medium">Editor failed to load</p>
          <p className="mt-1 opacity-90">{loadError}</p>
          <Button
            className="mt-3"
            onClick={() => setRetryKey((key) => key + 1)}
            type="button"
            variant="outline"
          >
            Retry
          </Button>
        </div>
        <textarea
          className="min-h-[220px] w-full rounded-xl border border-zinc-200/70 bg-white/80 p-3 font-mono text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </div>
    );
  }

  if (!EditorComponent) {
    return (
      <div className="space-y-2">
        {label ? (
          <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/60 text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400",
          )}
          style={{ minHeight: height }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading TinyMCE editor…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label ? (
        <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </label>
      ) : null}
      <div
        className="overflow-hidden rounded-xl border border-zinc-200/70 dark:border-white/10"
        style={{ minHeight: height }}
      >
        <EditorComponent
          disabled={disabled}
          init={{
            base_url: "/tinymce",
            suffix: ".min",
            height,
            menubar: true,
            skin: isDark ? "oxide-dark" : "oxide",
            content_css: isDark ? "dark" : "default",
            plugins: [
              "advlist",
              "autolink",
              "lists",
              "link",
              "image",
              "charmap",
              "preview",
              "anchor",
              "searchreplace",
              "visualblocks",
              "code",
              "fullscreen",
              "insertdatetime",
              "media",
              "table",
              "help",
              "wordcount",
            ],
            toolbar:
              "undo redo | blocks | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | removeformat code fullscreen | help",
            content_style:
              "body { font-family: system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; }",
            promotion: false,
            branding: false,
            automatic_uploads: true,
            images_reuse_filename: true,
            file_picker_types: "image",
            images_upload_handler: onImageUpload
              ? (blobInfo) => handleBlobUpload(blobInfo)
              : undefined,
            file_picker_callback: onImageUpload
              ? (callback, _value, meta) => {
                  if (meta.filetype !== "image") return;
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/jpeg,image/png,image/webp,image/gif";
                  input.onchange = () => {
                    const file = input.files?.[0];
                    if (!file || !onImageUploadRef.current) return;
                    void onImageUploadRef.current(file)
                      .then((url) => callback(url, { title: file.name }))
                      .catch((err: unknown) => {
                        window.alert(
                          err instanceof Error ? err.message : "Image upload failed.",
                        );
                      });
                  };
                  input.click();
                }
              : undefined,
          }}
          key={`${isDark ? "dark" : "light"}-${retryKey}`}
          licenseKey="gpl"
          onEditorChange={onChange}
          value={value}
        />
      </div>
    </div>
  );
}
