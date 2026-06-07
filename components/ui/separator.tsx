import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      className={cn(
        "h-px w-full bg-zinc-200/70 transition-colors duration-150 ease-out dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
