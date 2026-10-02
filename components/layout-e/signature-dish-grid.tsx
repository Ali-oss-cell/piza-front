"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cinematicTransition } from "@/lib/layout-e/motion-tokens";
import { getMenuDisplayDescription } from "@/lib/menu-display-copy";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

function dishLayoutId(id: string): string {
  return `portfolio-dish-${id}`;
}

function SignatureTile({
  item,
  onSelect,
}: {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}): React.ReactElement {
  const src = resolveMediaUrl(item.imageUrl) ?? item.imageUrl;
  const desc = getMenuDisplayDescription(item);

  return (
    <button
      className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900 text-left"
      type="button"
      onClick={() => onSelect(item)}
    >
      <motion.div
        className="absolute inset-0"
        layoutId={dishLayoutId(item.id)}
        transition={cinematicTransition}
      >
        <Image
          alt={item.imageAlt}
          className="object-cover brightness-[0.92] contrast-[1.05] saturate-[0.92] transition duration-700 group-hover:scale-105"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={src}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="font-display text-xl font-bold text-white">{item.name}</p>
        <p className="mt-1 line-clamp-1 text-sm text-white/70">{desc}</p>
      </div>
    </button>
  );
}

export function SignatureDishGrid({
  items,
}: {
  items: MenuItem[];
}): React.ReactElement {
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <LayoutGroup>
      <div className="mt-10 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {items.map((item) => (
          <SignatureTile
            item={item}
            key={item.id}
            onSelect={setSelected}
          />
        ))}
      </div>

      <Dialog.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <AnimatePresence>
          {selected ? (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content
                className={cn(
                  "fixed left-1/2 top-1/2 z-50 w-[min(96vw,32rem)] -translate-x-1/2 -translate-y-1/2 outline-none",
                )}
                asChild
              >
                <motion.div
                  className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={cinematicTransition}
                >
                  <div className="relative aspect-[4/5] w-full bg-zinc-900 sm:aspect-[5/4]">
                    <motion.div
                      className="absolute inset-0"
                      layoutId={dishLayoutId(selected.id)}
                      transition={cinematicTransition}
                    >
                      <Image
                        alt={selected.imageAlt}
                        className="object-cover"
                        fill
                        sizes="32rem"
                        src={
                          resolveMediaUrl(selected.imageUrl) ?? selected.imageUrl
                        }
                      />
                    </motion.div>
                    <Dialog.Close
                      className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </Dialog.Close>
                  </div>
                  <div className="p-5">
                    <Dialog.Title className="font-display text-2xl font-bold text-white">
                      {selected.name}
                    </Dialog.Title>
                    <Dialog.Description className="mt-2 text-sm text-white/65">
                      {getMenuDisplayDescription(selected)}
                    </Dialog.Description>
                    <div className="mt-5 flex gap-3">
                      <Button asChild className="flex-1 rounded-full" variant="pill">
                        <Link href={`/menu/${selected.id}`}>Order this</Link>
                      </Button>
                      <Dialog.Close asChild>
                        <Button
                          className="rounded-full border-white/20 text-white"
                          type="button"
                          variant="outline"
                        >
                          Close
                        </Button>
                      </Dialog.Close>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          ) : null}
        </AnimatePresence>
      </Dialog.Root>
    </LayoutGroup>
  );
}
