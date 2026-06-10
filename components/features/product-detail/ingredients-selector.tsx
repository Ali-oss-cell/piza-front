"use client";

import { Minus, Plus } from "lucide-react";
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
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all",
              isRemoved
                ? "border-zinc-200/40 bg-zinc-100/50 text-zinc-400 line-through dark:border-white/5 dark:bg-zinc-950/40 dark:text-zinc-500"
                : "border-zinc-200/60 bg-zinc-50/80 text-zinc-700 hover:border-[#d81b60]/30 hover:bg-[#d81b60]/5 dark:border-white/5 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:border-[#d81b60]/30"
            )}
            key={ingredient}
            onClick={() => onToggle(ingredient)}
            type="button"
          >
            <span>{ingredient}</span>
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                isRemoved
                  ? "border-zinc-300/60 text-zinc-500 dark:border-white/10 dark:text-zinc-400"
                  : "border-[#d81b60]/40 bg-[#d81b60]/10 text-[#d81b60]"
              )}
            >
              {isRemoved ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
