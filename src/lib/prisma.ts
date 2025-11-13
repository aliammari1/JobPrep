import { PrismaClient } from "../generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Validate database URLs before creating client
if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
  console.warn(
    "⚠️  Warning: Neither POSTGRES_PRISMA_URL nor DATABASE_URL is set. " +
    "Database operations will fail. Please set one of these environment variables."
  );
}

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"]
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
