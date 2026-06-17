import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement {
  return (
    <label
      className={cn("text-sm font-medium text-zinc-700 dark:text-zinc-300", className)}
      {...props}
    />
  );
}
