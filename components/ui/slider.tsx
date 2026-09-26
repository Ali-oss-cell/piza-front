"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  valueLabel?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  valueLabel,
  onChange,
  className,
}: SliderProps): React.ReactElement {
  const inputId = id ?? `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <label className="font-medium text-zinc-700 dark:text-zinc-300" htmlFor={inputId}>
          {label}
        </label>
        <span className="text-lg font-bold text-zinc-950 dark:text-white">
          {valueLabel ?? value}
        </span>
      </div>
      <input
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 dark:bg-zinc-700",
          "accent-[color:var(--brand-accent,#d81b60)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent,#d81b60)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950",
          "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[color:var(--brand-accent,#d81b60)] [&::-webkit-slider-thumb]:shadow-md",
          "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[color:var(--brand-accent,#d81b60)]"
        )}
        id={inputId}
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
      <div className="mt-1.5 flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
