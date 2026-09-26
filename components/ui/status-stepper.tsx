import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusStep {
  id: string;
  label: string;
}

interface StatusStepperProps {
  steps: StatusStep[];
  /** 0-based index of current (in-progress) step; all before are complete */
  currentIndex: number;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function StatusStepper({
  steps,
  currentIndex,
  className,
  orientation = "horizontal",
}: StatusStepperProps): React.ReactElement {
  const isVertical = orientation === "vertical";

  return (
    <ol
      className={cn(
        isVertical ? "flex flex-col gap-0" : "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-2",
        className
      )}
    >
      {steps.map((step, index) => {
        const complete = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li
            className={cn(
              "relative flex",
              isVertical ? "gap-4 pb-8 last:pb-0" : "flex-1 flex-col items-center gap-2 sm:min-w-0"
            )}
            key={step.id}
          >
            {isVertical && index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5",
                  complete ? "bg-[color:var(--brand-accent,#d81b60)]" : "bg-zinc-200 dark:bg-zinc-700"
                )}
              />
            ) : null}
            <div
              className={cn(
                "relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                complete || active
                  ? "border-[color:var(--brand-accent,#d81b60)] bg-[color:var(--brand-accent,#d81b60)] text-white"
                  : "border-zinc-300 bg-white text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900"
              )}
            >
              {complete ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <p
              className={cn(
                "text-sm font-semibold",
                isVertical ? "pt-1" : "text-center",
                complete || active
                  ? "text-zinc-950 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {step.label}
            </p>
            {!isVertical && index < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute left-[calc(50%+1.25rem)] top-4 hidden h-0.5 w-[calc(100%-2.5rem)] sm:block",
                  complete ? "bg-[color:var(--brand-accent,#d81b60)]" : "bg-zinc-200 dark:bg-zinc-700"
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
