import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  __prismaPool: Pool | undefined;
};

function getConnectionString(): string | undefined {
  return process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
}

// Validate database URLs before creating client
if (!getConnectionString()) {
  console.warn(
    "⚠️  Warning: Neither POSTGRES_PRISMA_URL nor DATABASE_URL is set. " +
      "Database operations will fail. Please set one of these environment variables.",
  );
}

function getPool(): Pool {
  if (!globalForPrisma.__prismaPool) {
    // `pg` owns pooling in Prisma 7 (Prisma v6 engine defaults no longer
    // apply). `max` keeps serverless/edge usage bounded; Hyperdrive manages
    // pooling at the edge, so this is the app-level ceiling, not the only pool.
    // Cloudflare Hyperdrive: wire its connection string into DATABASE_URL /
    // POSTGRES_PRISMA_URL — no code change needed (see docs/DEPLOYMENT.md).
    globalForPrisma.__prismaPool = new Pool({
      connectionString: getConnectionString(),
      max: Number(process.env.PG_POOL_MAX || 10),
      // `pg` has no connection timeout by default (0); restore a v6-like
      // 5s ceiling so misconfigured DBs fail fast instead of hanging.
      connectionTimeoutMillis: Number(
        process.env.PG_CONNECTION_TIMEOUT_MS || 5000,
      ),
    });
  }
  return globalForPrisma.__prismaPool;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg(getPool());
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
