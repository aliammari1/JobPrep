// @ts-expect-error - types resolved once @opennextjs/cloudflare is installed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext (Cloudflare) configuration.
 *
 * Builds the Next.js app into a Cloudflare Worker. The adapter and Wrangler
 * are committed development dependencies; use `bun run cf:*` scripts so CI
 * and local builds execute the lockfile's exact dependency graph.
 *
 * Note: the Python LiveKit/Simli avatar agent in functions/ is a long-running
 * container workload and CANNOT run on Workers — deploy it separately (small
 * container/VM). Only the Next.js app targets Cloudflare here.
 */
export default defineCloudflareConfig({
  // Default incremental cache. Swap for an R2/KV-backed cache for production.
});
