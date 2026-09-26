import * as React from "react";
import { cardPadding, cardShell, cardShellHover } from "@/lib/theme-classes";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, padded = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardShell, hover && cardShellHover, padded && cardPadding, className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
