"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

export function QuantitySelector({
  quantity,
  onDecrement,
  onIncrement,
}: QuantitySelectorProps): React.ReactElement {
  return (
    <div className="inline-flex items-center rounded-xl border border-zinc-200/60 bg-white/70 p-1 backdrop-blur-md transition-colors duration-150 ease-out dark:border-white/10 dark:bg-zinc-900/40">
      <Button
        className="h-10 w-10 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        onClick={onDecrement}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="min-w-12 text-center text-lg font-semibold text-zinc-950 transition-colors duration-150 ease-out dark:text-white">
        {quantity}
      </span>
      <Button
        className="h-10 w-10 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
        onClick={onIncrement}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
