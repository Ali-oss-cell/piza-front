"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNextOrderEmbedUrl } from "@/lib/nextorder";

const LOAD_TIMEOUT_MS = 12_000;

export function NextOrderEmbed(): React.ReactElement {
  const embedUrl = getNextOrderEmbedUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const loadedRef = useRef(false);

  const revealFallback = useCallback((): void => {
    if (loadedRef.current) {
      return;
    }
    setShowFallback(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(revealFallback, LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [revealFallback]);

  const handleLoad = (): void => {
    loadedRef.current = true;
    setIsLoading(false);
  };

  if (showFallback) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white">
            Order online
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            NextOrder may not allow embedding in other websites. Open our full ordering menu in a
            new tab to browse, customise, and checkout.
          </p>
        </div>
        <Button asChild className="gap-2">
          <a href={embedUrl} rel="noopener noreferrer" target="_blank">
            <ExternalLink className="h-4 w-4" />
            Open NextOrder
          </a>
        </Button>
        <Link
          className="text-sm font-medium text-[color:var(--brand-accent,#d81b60)] hover:underline"
          href="/"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] w-full bg-zinc-100 dark:bg-zinc-950">
      {isLoading ? (
        <div
          aria-hidden
          className="absolute inset-0 z-10 animate-pulse bg-zinc-200/80 dark:bg-zinc-900/80"
        />
      ) : null}
      <iframe
        allow="payment *; geolocation *"
        className="absolute inset-0 h-full w-full border-0"
        onError={revealFallback}
        onLoad={handleLoad}
        src={embedUrl}
        title="Order online — Benny Boy's"
      />
    </div>
  );
}
