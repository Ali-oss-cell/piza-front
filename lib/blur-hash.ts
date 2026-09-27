import { decode } from "blurhash";

/**
 * Convert a BlurHash string into a tiny PNG data URL for image placeholders.
 * Client-only (uses canvas).
 */
export function blurHashToDataUrl(
  hash: string,
  width = 32,
  height = 32
): string | null {
  if (typeof document === "undefined" || !hash.trim()) {
    return null;
  }

  try {
    const pixels = decode(hash, width, height);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }
    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  } catch {
    return null;
  }
}
