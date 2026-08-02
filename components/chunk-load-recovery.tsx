"use client";

import { useEffect } from "react";

const RELOAD_KEY = "chunk-load-reload-at";
const RELOAD_COOLDOWN_MS = 15_000;

function isChunkLoadFailure(error: unknown): boolean {
  if (!error) {
    return false;
  }

  const name = error instanceof Error ? error.name : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error);

  return (
    name === "ChunkLoadError" ||
    /ChunkLoadError/i.test(message) ||
    /Failed to load chunk/i.test(message) ||
    /Loading chunk [\w.-]+ failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  );
}

function reloadOnceForChunkError(): void {
  try {
    const previous = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
    const now = Date.now();
    if (previous && now - previous < RELOAD_COOLDOWN_MS) {
      return;
    }
    sessionStorage.setItem(RELOAD_KEY, String(now));
  } catch {
    // sessionStorage unavailable — still attempt one reload
  }

  window.location.reload();
}

/**
 * After a deploy or a brief network blip, Next may fail to fetch a JS chunk
 * (ChunkLoadError / ERR_NETWORK_CHANGED). One hard reload usually recovers.
 */
export function ChunkLoadRecovery(): null {
  useEffect(() => {
    const onError = (event: ErrorEvent): void => {
      if (isChunkLoadFailure(event.error) || isChunkLoadFailure(event.message)) {
        reloadOnceForChunkError();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
      if (isChunkLoadFailure(event.reason)) {
        reloadOnceForChunkError();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
