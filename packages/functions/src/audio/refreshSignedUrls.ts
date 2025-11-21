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
    secrets: [supabaseUrlParam],
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: refreshSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializePool();
      client = await pool.connect();

      // Query audio_records with expiring URLs
      const audioRecordsQuery = `
          SELECT id, storage_path 
          FROM audio_records 
          WHERE audio_url_expires_at < NOW() + interval '3 day';
      `;
      const { rows: audioRecords } = await client.query(audioRecordsQuery);

      // Query flashcards with question audio URLs
      const flashcardsQuery = `
          SELECT id, question_audio_url 
          FROM flashcards 
          WHERE question_audio_url IS NOT NULL 
            AND question_audio_url != '';
      `;
      const { rows: flashcards } = await client.query(flashcardsQuery);

      const totalRecords = audioRecords.length + flashcards.length;

      if (totalRecords === 0) {
        logger.info("No expiring URLs to refresh. Job finished.");
        return;
      }

      logger.info(
        `Found ${audioRecords.length} audio_records and ${flashcards.length} flashcards to refresh.`
      );

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

        const [exists] = await file.exists();
        if (!exists) {
          logger.warn(
            `Skipping flashcard with id "${id}" - file does not exist at path: ${storagePath}`
          );
          continue;
        }

        const [newUrl] = await file.getSignedUrl({
          action: "read",
          expires: oneMonthFromNow,
        });

        await client.query(
          "UPDATE flashcards SET question_audio_url = $1 WHERE id = $2",
          [newUrl, id]
        );

        logger.info(`Updated flashcard ${id} with new signed URL.`);
      }

      logger.info(
        `Successfully refreshed ${totalRecords} signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
