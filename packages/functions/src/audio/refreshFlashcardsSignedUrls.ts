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
    logger.info("Starting job: refreshFlashcardsSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializePool();
      client = await pool.connect();

      // Query flashcards with question audio URLs
      const flashcardsQuery = `
          SELECT id, question_audio_url 
          FROM flashcards 
          WHERE question_audio_url IS NOT NULL 
            AND question_audio_url != ''
          LIMIT 1000;
      `;
      const { rows: flashcards } = await client.query(flashcardsQuery);

      if (flashcards.length === 0) {
        logger.info("No flashcards URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${flashcards.length} flashcards to refresh.`);

      const storage = admin.storage();
      const bucket = storage.bucket(bucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      // Update flashcards
      for (const flashcard of flashcards) {
        const currentUrl: string = flashcard.question_audio_url;
        const id: string = flashcard.id;

        if (!currentUrl) {
          continue;
        }

        const storagePath = extractStoragePath(currentUrl);

        if (!storagePath) {
          logger.warn(
            `Skipping flashcard with id "${id}" - could not extract storage path from URL.`
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
            "UPDATE flashcards SET question_audio_url = $1 WHERE id = $2",
            [newUrl, id]
          );

          logger.info(`Updated flashcard ${id} with new signed URL.`);
        } catch (error) {
          // File doesn't exist or other error - clear the question_audio_url
          await client.query(
            "UPDATE flashcards SET question_audio_url = NULL WHERE id = $1",
            [id]
          );
          logger.warn(
            `Cleared question_audio_url for flashcard ${id} - error generating signed URL: ${error}`
          );
        }
      }

      logger.info(
        `Successfully refreshed ${flashcards.length} flashcards signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshFlashcardsSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
