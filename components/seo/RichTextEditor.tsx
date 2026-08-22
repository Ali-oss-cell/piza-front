"use client";

import { useEffect, useState } from "react";
import type { IAllProps } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: RichTextEditorProps): React.ReactElement {
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

  if (useFallback || !EditorComponent) {
    return (
      <textarea
        className="min-h-[280px] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    );
  }

  return (
    <EditorComponent
      disabled={disabled}
      init={{
        base_url: "/tinymce",
        suffix: ".min",
        height: 360,
        menubar: false,
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
      onEditorChange={onChange}
      value={value}
    />
  );
}
