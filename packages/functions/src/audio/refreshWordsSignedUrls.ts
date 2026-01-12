import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { Pool, PoolClient } from "pg";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import * as Sentry from "@sentry/node";
import { extractStoragePath } from "../utils/extractStoragePath";
import { initializeSentry } from "../bootstrap";

const oldSupabaseUrlParam = defineSecret("OLD_SUPABASE_DATABASE_URL");
const learningBucketNameParam = defineSecret("LEARNING_STORAGE_BUCKET");

let oldSupabasePool: Pool;

const initializeOldSupabasePool = (): Pool => {
  try {
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
  } catch (error) {
    Sentry.captureException(error, {
      tags: { function: "initializeOldSupabasePool" },
    });
    throw error;
  }
};

export default onSchedule(
  {
    schedule: "every 24 hours",
    region: "europe-west1",
    timeoutSeconds: 540,
    secrets: [oldSupabaseUrlParam, learningBucketNameParam],
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: refreshWordsSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializeOldSupabasePool();
      client = await pool.connect();

      // Query words with audio URLs - note: this assumes en_audio_url_expires_at column exists
      // If not, you need to add it to the words table in old project first
      const wordsQuery = `
          SELECT name, audio_url
          FROM words
          WHERE audio_url IS NOT NULL
            AND audio_url != ''
            AND (audio_url_expires_at IS NULL
                 OR audio_url_expires_at < NOW() + interval '7 day')
          ORDER BY audio_url_expires_at ASC NULLS FIRST
          LIMIT 2000;
      `;
      const { rows: words } = await client.query(wordsQuery);

      if (words.length === 0) {
        logger.info("No words URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${words.length} words to refresh.`);

      const storage = admin.storage();
      const learningBucket = storage.bucket(learningBucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      // Update words
      for (const word of words) {
        const currentUrl: string = word.audio_url;
        const name: string = word.name;

        if (!currentUrl) {
          continue;
        }

        const storagePath = extractStoragePath(currentUrl);

        if (!storagePath) {
          logger.warn(
            `Skipping word with name "${name}" - could not extract storage path from URL.`
          );
          continue;
        }

        const file = learningBucket.file(storagePath);

        const [newUrl] = await file.getSignedUrl({
          action: "read",
          expires: oneMonthFromNow,
        });

        await client.query(
          "UPDATE words SET audio_url = $1, audio_url_expires_at = $2 WHERE name = $3",
          [newUrl, oneMonthFromNow.toISOString(), name]
        );

        logger.info(`Updated word "${name}" with new signed URL.`);
      }

      logger.info(
        `Successfully refreshed ${words.length} words signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshWordsSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
