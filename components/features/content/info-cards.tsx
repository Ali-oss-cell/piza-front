"use client";

import { StaggerGrid } from "@/components/motion/stagger-grid";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InfoCard {
  title: string;
  description: string;
  icon?: LucideIcon;
}

interface InfoCardsProps {
  items: InfoCard[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function InfoCards({
  items,
  columns = 3,
  className = "",
}: InfoCardsProps): React.ReactElement {
  const gridClass =
    columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : columns === 4
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <StaggerGrid className={cn("grid gap-6", gridClass, className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            className="rounded-2xl border border-zinc-200/70 bg-zinc-50/50 p-6 dark:border-white/10 dark:bg-zinc-900/30"
            key={item.title}
          >
            {Icon ? (
              <Icon className="mb-4 h-8 w-8 text-[color:var(--brand-accent,#d81b60)]" />
            ) : null}
            <h3 className="text-lg font-bold">{item.title}</h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">{item.description}</p>
          </div>
        );
      })}
    </StaggerGrid>
  );
}
