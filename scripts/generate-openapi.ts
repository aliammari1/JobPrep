/**
 * Generates a static openapi.json at the repo root for docs tooling
 * (Mintlify / Scalar / Spectral). Run with: `bun run openapi:generate`.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getApiDocs } from "../src/lib/openapi";

const spec = getApiDocs();
const out = join(process.cwd(), "openapi.json");
writeFileSync(out, `${JSON.stringify(spec, null, 2)}\n`);

const pathCount = Object.keys(
  (spec as { paths?: Record<string, unknown> }).paths ?? {},
).length;
console.log(`Wrote ${out} (${pathCount} documented path(s)).`);
