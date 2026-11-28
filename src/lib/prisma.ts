import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { cloudflareContext } from "./cloudflare";

const local = globalThis as typeof globalThis & {
  jobprepPrisma?: PrismaClient;
  __jobprepPrismaCleanup?: WeakMap<object, () => Promise<void>>;
};
const workerClients = new WeakMap<object, PrismaClient>();
local.__jobprepPrismaCleanup ??= new WeakMap<object, () => Promise<void>>();

function createClient(connectionString: string | undefined, worker: boolean) {
  const pool = new Pool({
    connectionString,
    max: worker ? 1 : Number(process.env.PG_POOL_MAX || 10),
    connectionTimeoutMillis: Number(
      process.env.PG_CONNECTION_TIMEOUT_MS || 5000,
    ),
    ...(worker ? { idleTimeoutMillis: 500, allowExitOnIdle: true } : {}),
  });
  return new PrismaClient({
    adapter: new PrismaPg(pool, { disposeExternalPool: true }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function clientForRequest(): PrismaClient {
  const request = cloudflareContext();
  if (request) {
    const client = workerClients.get(request.ctx);
    if (client) return client;
    const connectionString =
      request.env.HYPERDRIVE?.connectionString ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.DATABASE_URL;
    const newClient = createClient(connectionString, true);
    workerClients.set(request.ctx, newClient);
    local.__jobprepPrismaCleanup?.set(request.ctx, () =>
      newClient.$disconnect(),
    );
    return newClient;
  }
  local.jobprepPrisma ??= createClient(
    process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL,
    false,
  );
  return local.jobprepPrisma;
}

// Better Auth and route modules import Prisma during build. Resolve the
// request-bound Hyperdrive connection when an operation actually runs.
const prisma = new Proxy({} as PrismaClient, {
  get(_target, key) {
    const client = clientForRequest();
    const value = Reflect.get(client, key, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
