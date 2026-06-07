"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartToastProps {
  message: string;
  visible: boolean;
  exiting: boolean;
}

export function AddToCartToast({
  message,
  visible,
  exiting,
}: AddToCartToastProps): React.ReactElement | null {
  if (!visible) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-24 z-[70] md:right-8"
      role="status"
    >
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/85 px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-2xl shadow-zinc-300/40 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/80 dark:text-white dark:shadow-black/40",
          exiting ? "animate-toastOut" : "animate-toastIn"
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d81b60]">
          <Check className="h-3 w-3 text-white" />
        </span>
        {message}
      </div>
    </div>
  );
}
