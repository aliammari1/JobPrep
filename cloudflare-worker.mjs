import { Pool } from "pg";
import app from "./.open-next/worker.js";

export * from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    try {
      return await app.fetch(request, env, ctx);
    } finally {
      const cleanup = globalThis.__jobprepPrismaCleanup?.get(ctx);
      if (cleanup) {
        globalThis.__jobprepPrismaCleanup.delete(ctx);
        ctx.waitUntil(cleanup().catch(() => {}));
      }
    }
  },

  async scheduled(_event, env) {
    const connectionString =
      env.HYPERDRIVE?.connectionString ??
      env.POSTGRES_PRISMA_URL ??
      env.DATABASE_URL;
    if (!connectionString || !env.RECORDINGS_BUCKET) {
      throw new Error(
        "Recording cleanup requires PostgreSQL and the RECORDINGS_BUCKET binding",
      );
    }

    const pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000,
    });
    const client = await pool.connect().catch(async (error) => {
      await pool.end();
      throw error;
    });
    try {
      for (let processed = 0; processed < 20; processed += 1) {
        await client.query("BEGIN");
        try {
          const result = await client.query(
            `SELECT "objectKey", "attempts" FROM "recording_object_cleanup"
             WHERE "deleteAfter" <= CURRENT_TIMESTAMP
             ORDER BY "deleteAfter" LIMIT 1 FOR UPDATE SKIP LOCKED`,
          );
          const item = result.rows[0];
          if (!item) {
            await client.query("COMMIT");
            return;
          }

          const live = await client.query(
            'SELECT 1 FROM "interview" WHERE "recordingObjectKey" = $1',
            [item.objectKey],
          );
          if (!live.rowCount) {
            try {
              await env.RECORDINGS_BUCKET.delete(item.objectKey);
            } catch (error) {
              const retryMinutes = 2 ** Math.min(item.attempts, 8);
              await client.query(
                `UPDATE "recording_object_cleanup"
                 SET "attempts" = "attempts" + 1,
                     "deleteAfter" = CURRENT_TIMESTAMP + $2 * INTERVAL '1 minute'
                 WHERE "objectKey" = $1`,
                [item.objectKey, retryMinutes],
              );
              await client.query("COMMIT");
              console.error(
                JSON.stringify({
                  event: "r2_recording_cleanup_retry",
                  objectKey: item.objectKey,
                  attempts: item.attempts + 1,
                  retryMinutes,
                  error: error instanceof Error ? error.message : String(error),
                }),
              );
              continue;
            }
          }

          await client.query(
            'DELETE FROM "recording_object_cleanup" WHERE "objectKey" = $1',
            [item.objectKey],
          );
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        }
      }
    } finally {
      client.release();
      await pool.end();
    }
  },
};
