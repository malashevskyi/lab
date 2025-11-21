import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Pool, PoolClient } from "pg";
import { defineString } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as Sentry from "@sentry/node";

const supabaseUrlParam = defineString("SUPABASE_DATABASE_URL");
const bucketNameParam = defineString("STORAGE_BUCKET");

let supabasePool: Pool;

const initializePool = (): Pool => {
  try {
    if (!supabasePool) {
      const connectionString = supabaseUrlParam.value();
      if (!connectionString) {
        throw new Error(
          "SUPABASE_DATABASE_URL parameter is not available at runtime.",
        );
      }
      supabasePool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
    }
    return supabasePool;
  } catch (error) {
    Sentry.captureException(error, { tags: { function: "initializePool" } });
    throw error;
  }
};

export default onSchedule(
  {
    schedule: "every 24 hours",
    region: "europe-west1",
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: refreshSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializePool();
      client = await pool.connect();

      const query = `
          SELECT id, storage_path 
          FROM audio_records 
          WHERE audio_url_expires_at < NOW() + interval '3 day';
      `;
      const { rows } = await client.query(query);

      if (rows.length === 0) {
        logger.info("No expiring URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${rows.length} record(s) to refresh.`);

      const storage = admin.storage();
      const bucket = storage.bucket(bucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      for (const record of rows) {
        const storagePath: string = record.storage_path;
        const id: string = record.id;

        if (!storagePath) {
          logger.warn(
            `Skipping record with id "${id}" due to empty storage_path.`,
          );
          continue;
        }

        const file = bucket.file(storagePath);

        const [newUrl] = await file.getSignedUrl({
          action: "read",
          expires: oneMonthFromNow,
        });

        await client.query(
          "UPDATE audio_records SET audio_url = $1, audio_url_expires_at = $2 WHERE id = $3",
          [newUrl, oneMonthFromNow.toISOString(), id],
        );
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  },
);
