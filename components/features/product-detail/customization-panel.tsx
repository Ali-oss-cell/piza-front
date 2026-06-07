"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CustomizationPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CustomizationPanel({
  title,
  subtitle,
  children,
  defaultOpen = true,
}: CustomizationPanelProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-zinc-200/60 bg-white/70 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40">
      <button
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-600 transition-colors duration-150 ease-out dark:text-zinc-400">
              {subtitle}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-zinc-600 transition-transform duration-150 ease-out dark:text-zinc-400",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen ? (
        <div className="border-t border-zinc-200/60 px-5 py-5 transition-colors duration-150 ease-out dark:border-white/10 md:px-6">
          {children}
        </div>
      ) : null}
    </section>
  );
}
