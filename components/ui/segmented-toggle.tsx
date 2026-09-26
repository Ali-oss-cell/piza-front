"use client";

import { cn } from "@/lib/utils";

export interface SegmentedToggleOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string = string> {
  options: SegmentedToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedToggle<T extends string = string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Options",
}: SegmentedToggleProps<T>): React.ReactElement {
  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-full flex-wrap gap-1 rounded-xl border border-zinc-200/70 bg-zinc-100/80 p-1 dark:border-white/[0.08] dark:bg-zinc-900/60 sm:w-auto",
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            aria-selected={active}
            className={cn(
              "min-h-11 flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent,#d81b60)] sm:flex-none sm:px-5",
              active
                ? "bg-[color:var(--brand-accent,#d81b60)] text-white shadow-md shadow-[color:var(--brand-accent,#d81b60)]/20"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="tab"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
