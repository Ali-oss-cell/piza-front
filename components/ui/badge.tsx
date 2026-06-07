import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white",
        className
      )}
      {...props}
    />
  );
}
