"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;

function SheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Dialog.Content>): React.ReactElement {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 cart-overlay transition-colors duration-150 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in dark:bg-black/60" />
      <Dialog.Content
        className={cn(
          "fixed right-0 top-0 z-[60] h-full w-full border-l border-zinc-200/70 bg-white shadow-2xl transition-colors duration-150 ease-out data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right dark:border-white/10 dark:bg-zinc-950 md:w-[480px]",
          className
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-sm text-zinc-600 opacity-70 transition-opacity hover:opacity-100 dark:text-zinc-300">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };
