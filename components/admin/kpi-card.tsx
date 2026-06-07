import type { LucideIcon } from "lucide-react";
import { dashboardGlass, primaryText, secondaryText } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  highlight?: boolean;
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  highlight = false,
}: KpiCardProps): React.ReactElement {
  return (
    <div className={cn("p-6", dashboardGlass)}>
      <div className="mb-4 flex items-center justify-between">
        <span className={cn("text-sm font-medium", secondaryText)}>{label}</span>
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl",
            highlight ? "bg-[#d81b60]/15 text-[#d81b60]" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={cn("font-display text-3xl font-bold", highlight ? "text-[#d81b60]" : primaryText)}>
        {value}
      </p>
      {hint ? <p className={cn("mt-2 text-xs", secondaryText)}>{hint}</p> : null}
    </div>
  );
}
