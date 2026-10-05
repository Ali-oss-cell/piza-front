"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IngredientsSelectorProps {
  ingredients: string[];
  removedIngredients: string[];
  onToggle: (ingredient: string) => void;
}

export function IngredientsSelector({
  ingredients,
  removedIngredients,
  onToggle,
}: IngredientsSelectorProps): React.ReactElement {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {ingredients.map((ingredient) => {
        const isRemoved = removedIngredients.includes(ingredient);

        return (
          <button
            aria-pressed={!isRemoved}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
              isRemoved
                ? "border-zinc-200/40 bg-zinc-100/40 text-zinc-400 dark:border-white/5 dark:bg-zinc-950/40 dark:text-zinc-500"
                : "border-zinc-200/60 bg-zinc-50/80 text-zinc-800 hover:border-[color:var(--brand-accent,#d81b60)]/30 hover:bg-[color:var(--brand-accent,#d81b60)]/5 dark:border-white/5 dark:bg-zinc-950/80 dark:text-zinc-200 dark:hover:border-[color:var(--brand-accent,#d81b60)]/30"
            )}
            key={ingredient}
            onClick={() => onToggle(ingredient)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  isRemoved
                    ? "bg-zinc-300/70 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    : "bg-[color:var(--brand-accent,#d81b60)] text-white"
                )}
                aria-hidden
              >
                {isRemoved ? (
                  <X className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Check className="h-3 w-3 stroke-[2.5]" />
                )}
              </span>
              <span className={cn("truncate", isRemoved && "line-through opacity-80")}>
                {ingredient}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                isRemoved
                  ? "bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  : "bg-[color:var(--brand-accent,#d81b60)]/15 text-[color:var(--brand-accent,#d81b60)]"
              )}
            >
              {isRemoved ? "Removed" : "Included"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
