"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { IAllProps } from "@tinymce/tinymce-react";
import { Loader2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  height?: number;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  height = 280,
}: RichTextEditorProps): React.ReactElement {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [EditorComponent, setEditorComponent] = useState<
    React.ComponentType<IAllProps> | null
  >(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEditor() {
      try {
        const mod = await import("@tinymce/tinymce-react");
        if (!cancelled) {
          setEditorComponent(() => mod.Editor);
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true);
        }
      }
    }

    void loadEditor();
    return () => {
      cancelled = true;
    };
  }, []);

  if (useFallback) {
    return (
      <textarea
        className="min-h-[280px] w-full rounded-xl border border-zinc-200/70 bg-white/80 p-3 font-mono text-sm text-zinc-900 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    );
  }

  if (!EditorComponent) {
    return (
      <div className="flex min-h-[200px] items-center justify-center gap-2 rounded-xl border border-zinc-200/70 bg-white/60 text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-900/40 dark:text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading editor…
      </div>
    );
  }

  return (
    <EditorComponent
      disabled={disabled}
      init={{
        base_url: "/tinymce",
        suffix: ".min",
        height,
        menubar: false,
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
          "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat | code",
        content_style:
          "body { font-family: system-ui, sans-serif; font-size: 14px; }",
        promotion: false,
        branding: false,
      }}
      key={isDark ? "dark" : "light"}
      licenseKey="gpl"
      onEditorChange={onChange}
      value={value}
    />
  );
}
