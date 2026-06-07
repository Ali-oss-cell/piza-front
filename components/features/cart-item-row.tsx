import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  brandPink,
  panelBg,
  panelInset,
  primaryText,
  secondaryText,
} from "@/lib/theme-classes";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/menu";

interface CartItemRowProps {
  item: CartItem;
  onDecrement: (id: string) => void;
  onIncrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemRowProps): React.ReactElement {
  return (
    <div className="group flex items-start gap-4">
      <div
        className={cn(
          "h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-200/60 dark:border-white/10",
          panelBg
        )}
      >
        <Image
          alt={item.imageAlt}
          className="h-full w-full object-cover"
          height={96}
          src={item.imageUrl}
          width={96}
        />
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-start justify-between">
          <h3 className={cn("font-bold", primaryText)}>{item.name}</h3>
          <span className={cn("font-bold", brandPink)}>${item.price.toFixed(2)}</span>
        </div>
        <p className={cn("mb-4 text-label-sm", secondaryText)}>
          {item.size ? `Size ${item.size}` : ""}
          {item.crust ? `${item.size ? " · " : ""}${item.crust}` : ""}
          {(item.size || item.crust) && item.description ? " · " : ""}
          {item.description}
        </p>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex items-center rounded border border-zinc-200/60 dark:border-white/10",
              panelInset
            )}
          >
            <Button
              className="h-8 w-8 p-0"
              onClick={() => onDecrement(item.id)}
              size="icon"
              variant="ghost"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className={cn("w-8 text-center text-label-md", primaryText)}>{item.quantity}</span>
            <Button
              className="h-8 w-8 p-0"
              onClick={() => onIncrement(item.id)}
              size="icon"
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="h-8 w-8 p-0 text-zinc-400 transition-colors duration-150 ease-out hover:text-[#d81b60] dark:text-zinc-500 dark:hover:text-[#d81b60]"
            onClick={() => onRemove(item.id)}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
