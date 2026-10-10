"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { formatCurrency } from "@/lib/pricing";
import type { ComboDeal } from "@/types/combo-deals";
import type { CartComboSelection, MenuItem } from "@/types/menu";
import { primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface PickStep {
  slotId: string;
  label: string;
  allowedSizes: string[];
  sourceType: "CATEGORY" | "ITEM";
  categorySlug: string | null;
  fixedMenuItemId: string | null;
}

interface ComboConfiguratorModalProps {
  deal: ComboDeal;
  menuItems: MenuItem[];
  open: boolean;
  onClose: () => void;
}

function expandSteps(deal: ComboDeal): PickStep[] {
  const steps: PickStep[] = [];
  for (const slot of [...deal.slots].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const sizes = Array.isArray(slot.allowedSizes)
      ? slot.allowedSizes.map(String)
      : [];
    for (let i = 0; i < slot.quantity; i += 1) {
      steps.push({
        slotId: slot.id,
        label:
          slot.quantity > 1
            ? `${slot.label} (${i + 1}/${slot.quantity})`
            : slot.label,
        allowedSizes: sizes,
        sourceType: slot.sourceType,
        categorySlug: slot.categorySlug,
        fixedMenuItemId: slot.menuItemId,
      });
    }
  }
  return steps;
}

export function ComboConfiguratorModal({
  deal,
  menuItems,
  open,
  onClose,
}: ComboConfiguratorModalProps): React.ReactElement | null {
  const { addComboToCart, setCartOpen } = useCart();
  const steps = useMemo(() => expandSteps(deal), [deal]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<CartComboSelection[]>([]);
  const [pickedItemId, setPickedItemId] = useState<string | null>(null);
  const [pickedSize, setPickedSize] = useState<string | undefined>();

  const step = steps[stepIndex];
  const price = Number(deal.bundlePrice);

  const eligibleItems = useMemo(() => {
    if (!step) return [];
    return menuItems.filter((item) => {
      if (step.sourceType === "ITEM") {
        return item.id === step.fixedMenuItemId || item.apiId === step.fixedMenuItemId;
      }
      return item.category === step.categorySlug;
    });
  }, [menuItems, step]);

  useEffect(() => {
    if (!open || !step) return;
    if (step.sourceType === "ITEM" && step.fixedMenuItemId) {
      setPickedItemId(step.fixedMenuItemId);
      return;
    }
    if (eligibleItems.length === 1) {
      setPickedItemId(eligibleItems[0].apiId || eligibleItems[0].id);
    }
  }, [open, stepIndex, step?.slotId, step?.fixedMenuItemId, step?.sourceType, eligibleItems.length]);

  if (!open) return null;

  const activeItem = eligibleItems.find(
    (item) =>
      item.id === pickedItemId ||
      item.apiId === pickedItemId,
  );

  function reset(): void {
    setStepIndex(0);
    setSelections([]);
    setPickedItemId(null);
    setPickedSize(undefined);
  }

  function confirmStep(): void {
    if (!step || !activeItem) return;
    if (step.allowedSizes.length > 0 && !pickedSize) return;

    const menuItemId = activeItem.apiId || activeItem.id;
    const next: CartComboSelection = {
      slotId: step.slotId,
      menuItemId,
      name: activeItem.name,
      size: pickedSize,
    };
    const nextSelections = [...selections, next];

    if (stepIndex + 1 >= steps.length) {
      const description = nextSelections
        .map((s) => (s.size ? `${s.name} (${s.size})` : s.name))
        .join(" · ");
      addComboToCart({
        comboDealId: deal.id,
        name: deal.name,
        description,
        price: Number.isFinite(price) ? price : 0,
        imageUrl: deal.imageUrl ?? undefined,
        imageAlt: deal.imageAlt ?? deal.name,
        selections: nextSelections,
      });
      reset();
      onClose();
      setCartOpen(true);
      return;
    }

    setSelections(nextSelections);
    setStepIndex(stepIndex + 1);
    setPickedItemId(null);
    setPickedSize(undefined);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={cn("font-display text-2xl font-bold", primaryText)}>
              {deal.name}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[color:var(--brand-accent,#d81b60)]">
              {formatCurrency(price)}
            </p>
            <p className={cn("mt-1 text-sm", secondaryText)}>
              Step {stepIndex + 1} of {steps.length}: {step?.label}
            </p>
          </div>
          <button
            className={cn("text-sm", secondaryText)}
            onClick={() => {
              reset();
              onClose();
            }}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {eligibleItems.map((item) => {
            const id = item.apiId || item.id;
            const selected = pickedItemId === id;
            return (
              <button
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left",
                  selected
                    ? "border-[color:var(--brand-accent,#d81b60)] bg-[color:var(--brand-accent,#d81b60)]/5"
                    : "border-zinc-200 dark:border-white/10",
                )}
                key={id}
                onClick={() => setPickedItemId(id)}
                type="button"
              >
                <span className={cn("font-semibold", primaryText)}>{item.name}</span>
              </button>
            );
          })}
          {eligibleItems.length === 0 ? (
            <p className={cn("py-6 text-center text-sm", secondaryText)}>
              No matching items for this slot.
            </p>
          ) : null}
        </div>

        {step?.allowedSizes.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {step.allowedSizes.map((size) => (
              <button
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold capitalize",
                  pickedSize === size
                    ? "bg-[color:var(--brand-accent,#d81b60)] text-white"
                    : "bg-zinc-100 dark:bg-zinc-800",
                )}
                key={size}
                onClick={() => setPickedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex gap-2">
          {stepIndex > 0 ? (
            <Button
              onClick={() => {
                setSelections((prev) => prev.slice(0, -1));
                setStepIndex((i) => Math.max(0, i - 1));
                setPickedItemId(null);
                setPickedSize(undefined);
              }}
              type="button"
              variant="outline"
            >
              Back
            </Button>
          ) : null}
          <Button
            className="flex-1"
            disabled={
              !activeItem ||
              (Boolean(step?.allowedSizes.length) && !pickedSize)
            }
            onClick={confirmStep}
            type="button"
          >
            {stepIndex + 1 >= steps.length ? "Add to cart" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
