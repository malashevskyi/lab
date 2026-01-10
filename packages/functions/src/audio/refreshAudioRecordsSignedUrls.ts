import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Pool, PoolClient } from "pg";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as Sentry from "@sentry/node";
import { initializeSentry } from "../bootstrap";

const supabaseUrlParam = defineSecret("SUPABASE_DATABASE_URL");
const bucketNameParam = defineSecret("STORAGE_BUCKET");

let supabasePool: Pool;

const initializePool = (): Pool => {
  try {
    if (!supabasePool) {
      const connectionString = supabaseUrlParam.value();
      if (!connectionString) {
        throw new Error(
          "SUPABASE_DATABASE_URL parameter is not available at runtime."
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
    secrets: [supabaseUrlParam, bucketNameParam],
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: refreshAudioRecordsSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializePool();
      client = await pool.connect();

      // Query audio_records with expiring URLs
      const audioRecordsQuery = `
          SELECT id, storage_path 
          FROM audio_records 
          WHERE audio_url_expires_at IS NULL 
             OR audio_url_expires_at < NOW() + interval '3 day';
      `;
      const { rows: audioRecords } = await client.query(audioRecordsQuery);

      if (audioRecords.length === 0) {
        logger.info("No expiring audio_records URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${audioRecords.length} audio_records to refresh.`);

      const storage = admin.storage();
      const bucket = storage.bucket(bucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      // Update audio_records
      for (const record of audioRecords) {
        const storagePath: string = record.storage_path;
        const id: string = record.id;

        if (!storagePath) {
          logger.warn(
            `Skipping audio_record with id "${id}" due to empty storage_path.`
          );
          continue;
        }

        const file = bucket.file(storagePath);
        const [exists] = await file.exists();

        if (!exists) {
          // File doesn't exist - clear the audio_url and storage_path
          await client.query(
            "UPDATE audio_records SET audio_url = NULL, storage_path = NULL, audio_url_expires_at = NULL WHERE id = $1",
            [id]
          );
          logger.warn(
            `Cleared audio_url and storage_path for audio_record ${id} - file does not exist at path: ${storagePath}`
          );
          continue;
        }

        // File exists - generate new signed URL
        const [newUrl] = await file.getSignedUrl({
          action: "read",
          expires: oneMonthFromNow,
        });

        await client.query(
          "UPDATE audio_records SET audio_url = $1, audio_url_expires_at = $2 WHERE id = $3",
          [newUrl, oneMonthFromNow.toISOString(), id]
        );

        logger.info(`Updated audio_record ${id} with new signed URL.`);
      }

      logger.info(
        `Successfully refreshed ${audioRecords.length} audio_records signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshAudioRecordsSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
