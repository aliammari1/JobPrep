import type { ImageLoaderProps } from "next/image";

/**
 * Cloudflare Images loader for `next/image`.
 *
 * On Cloudflare Workers (production), routes image transforms through
 * Cloudflare's `/cdn-cgi/image` edge pipeline instead of Node `sharp`.
 * In local development, serves the original asset directly.
 */
export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (process.env.NODE_ENV === "development") {
    return src;
  }

  // Data/blob URLs and SVGs should pass through untouched
  if (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.endsWith(".svg")
  ) {
    return src;
  }

  const params = [`width=${width}`, `quality=${quality ?? 75}`, "format=auto"];
  const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
  return `/cdn-cgi/image/${params.join(",")}/${normalizedSrc}`;
}
