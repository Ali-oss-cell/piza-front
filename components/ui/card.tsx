import * as React from "react";
import { cardShell } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(cardShell, className)} {...props} />
  )
);
Card.displayName = "Card";

export { Card };
