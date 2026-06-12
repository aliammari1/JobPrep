import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Don't run the app's Tailwind v4 PostCSS pipeline during unit tests; an empty
  // inline postcss config stops Vite from discovering postcss.config.mjs.
  css: {
    postcss: { plugins: [] },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      // Scope coverage to the modules that actually have tests today, then
      // ratchet this list (and thresholds) up as coverage grows. A repo-wide
      // 80% gate over an 80k-LOC app hard-fails CI for no useful signal.
      include: [
        "src/lib/utils.ts",
        "src/lib/subscription-plans.ts",
        "src/lib/ollama-client.ts",
        "src/lib/ai/**",
      ],
      thresholds: {
        // Conservative floor for the currently-tested surface. Raise as the
        // tested-module list above expands.
        lines: 60,
        functions: 50,
        branches: 60,
        statements: 60,
      },
    },
  },
});
