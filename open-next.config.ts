// @ts-expect-error - types resolved once @opennextjs/cloudflare is installed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext (Cloudflare) configuration.
 *
 * Builds the Next.js app into a Cloudflare Worker. Install the adapter with:
 *   bun add -D @opennextjs/cloudflare
 * then build + deploy with:
 *   bunx @opennextjs/cloudflare build && bunx wrangler deploy
 *
 * Note: the Python LiveKit/Simli avatar agent in functions/ is a long-running
 * container workload and CANNOT run on Workers — deploy it separately (small
 * container/VM). Only the Next.js app targets Cloudflare here.
 */
export default defineCloudflareConfig({
  // Default incremental cache. Swap for an R2/KV-backed cache for production.
});
