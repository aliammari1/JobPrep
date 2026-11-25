import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations always use the direct connection. The runtime prefers
    // POSTGRES_PRISMA_URL (pooled) with DATABASE_URL as fallback — see
    // src/lib/prisma.ts.
    url: env("DATABASE_URL"),
  },
});
