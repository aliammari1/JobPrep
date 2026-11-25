import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext (Cloudflare) configuration for JobPrep.
 *
 * Builds the Next.js 15 App Router app into a Cloudflare Worker.
 * Run `bun run cf:build` to compile and `bun run cf:preview` to test locally
 * on workerd.
 *
 * Note: the Python LiveKit/Simli avatar agent in `functions/` is a long-running
 * container workload and runs separately (Docker / Fly / Railway).
 */
export default defineCloudflareConfig({
  // Default incremental cache. To enable R2 incremental caching in production,
  // bind `NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc` and pass:
  // incrementalCache: r2IncrementalCache
});
