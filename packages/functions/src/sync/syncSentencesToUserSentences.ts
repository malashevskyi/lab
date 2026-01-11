import * as Sentry from "@sentry/node";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { Pool, type PoolClient } from "pg";
import { initializeSentry } from "../bootstrap.js";

const oldSupabaseUrlParam = defineSecret("OLD_SUPABASE_DATABASE_URL");

let oldSupabasePool: Pool;

const initializeOldSupabasePool = (): Pool => {
  if (!oldSupabasePool) {
    const connectionString = oldSupabaseUrlParam.value();
    if (!connectionString) {
      throw new Error(
        "OLD_SUPABASE_DATABASE_URL parameter is not available at runtime."
      );
    }
    oldSupabasePool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return oldSupabasePool;
};

const ADMIN_USER_ID = "78d70681-7bed-4f8b-8f27-64f675091cfb";

export default onSchedule(
  {
    schedule: "every 10 minutes",
    region: "europe-west1",
    secrets: [oldSupabaseUrlParam],
  },
  async () => {
    initializeSentry();
    let client: PoolClient | null = null;

    try {
      const pool = initializeOldSupabasePool();
      client = await pool.connect();

      // Insert missing sentences directly without fetching them first
      const insertQuery = `
        INSERT INTO "user-sentences" (id, en, "user", repeat, created_at)
        SELECT 
          $1 || '_' || s.en,
          s.en,
          $1,
          NOW() + (RANDOM() * INTERVAL '24 hours'),
          NOW()
        FROM sentences s
        LEFT JOIN "user-sentences" us 
          ON us.en = s.en AND us."user" = $1
        WHERE us.id IS NULL
        ON CONFLICT (id) DO NOTHING;
      `;

      const result = await client.query(insertQuery, [ADMIN_USER_ID]);

      logger.info(
        `Successfully synced ${result.rowCount} sentences to user-sentences for admin user.`
      );
    } catch (error) {
      logger.error("Failed to sync sentences to user-sentences:", error);
      Sentry.captureException(error, {
        tags: { function: "syncSentencesToUserSentences" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
