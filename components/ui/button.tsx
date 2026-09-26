"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-accent,#d81b60)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-[color:var(--brand-accent,#d81b60)] text-white hover:brightness-110",
        pill:
          "rounded-full bg-[color:var(--brand-accent,#d81b60)] text-white hover:brightness-110",
        secondary:
          "rounded-xl border border-zinc-200/70 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 dark:border-white/[0.08] dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
        ghost:
          "rounded-xl bg-transparent text-zinc-950 hover:bg-zinc-100 dark:text-white dark:hover:bg-white/10",
        outline:
          "rounded-xl border border-zinc-300 text-zinc-950 hover:bg-zinc-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5",
      },
      size: {
        default: "h-11 min-h-11 px-6 py-2",
        lg: "h-12 min-h-12 px-8 py-3",
        icon: "h-11 w-11 min-h-11 min-w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
