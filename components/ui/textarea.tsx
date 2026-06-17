import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-xl border border-zinc-200/70 bg-white/80 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors duration-150 ease-out placeholder:text-zinc-400 focus:border-[#d81b60] focus:ring-2 focus:ring-[#d81b60]/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-50 dark:placeholder:text-zinc-500",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
