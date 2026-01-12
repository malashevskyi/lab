import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Pool, PoolClient } from "pg";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as Sentry from "@sentry/node";
import { extractStoragePath } from "../utils/extractStoragePath";
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
    logger.info("Starting job: refreshChunksSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializePool();
      client = await pool.connect();

      // Query chunks with audio URLs
      const chunksQuery = `
          SELECT id, chunk_audio 
          FROM chunks 
          WHERE chunk_audio IS NOT NULL 
            AND chunk_audio != ''
            AND (chunk_audio_expires_at IS NULL 
                 OR chunk_audio_expires_at < NOW() + interval '7 day')
          ORDER BY chunk_audio_expires_at ASC NULLS FIRST
          LIMIT 1000;
      `;
      const { rows: chunks } = await client.query(chunksQuery);

      if (chunks.length === 0) {
        logger.info("No chunks URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${chunks.length} chunks to refresh.`);

      const storage = admin.storage();
      const bucket = storage.bucket(bucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      // Update chunks
      for (const chunk of chunks) {
        const currentUrl: string = chunk.chunk_audio;
        const id: string = chunk.id;

        if (!currentUrl) {
          continue;
        }

        const storagePath = extractStoragePath(currentUrl);

        if (!storagePath) {
          logger.warn(
            `Skipping chunk with id "${id}" - could not extract storage path from URL.`
          );
          continue;
        }

        const file = bucket.file(storagePath);

        try {
          // Generate new signed URL - if file doesn't exist, this will throw an error
          const [newUrl] = await file.getSignedUrl({
            action: "read",
            expires: oneMonthFromNow,
          });

          await client.query(
            "UPDATE chunks SET chunk_audio = $1, chunk_audio_expires_at = $2 WHERE id = $3",
            [newUrl, oneMonthFromNow.toISOString(), id]
          );

          logger.info(`Updated chunk ${id} with new signed URL.`);
        } catch (error) {
          // File doesn't exist or other error
          // TODO: consider clearing the chunk_audio and chunk_audio_expires_at
          // await client.query(
          //   "UPDATE chunks SET chunk_audio = NULL, chunk_audio_expires_at = NULL WHERE id = $1",
          //   [id]
          // );
          logger.warn(
            `Failed to refresh URL for chunk ${id} - error: ${error}. URL NOT cleared to prevent data loss.`
          );
        }
      }

      logger.info(
        `Successfully refreshed ${chunks.length} chunks signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshChunksSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
