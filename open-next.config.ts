import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext (Cloudflare) configuration for JobPrep.
 *
 * Uses Cloudflare R2 (`NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc`) for
 * persistent ISR and Next.js Data Cache across global Worker isolates.
 *
 * Run `bun run cf:build` to compile and `bun run cf:preview` to test locally
 * on workerd.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
