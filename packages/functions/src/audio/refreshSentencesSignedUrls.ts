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
const deepReadBucketNameParam = defineSecret("STORAGE_BUCKET");

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
    secrets: [
      oldSupabaseUrlParam,
      learningBucketNameParam,
      deepReadBucketNameParam,
    ],
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: refreshSentencesSignedUrls");
    let client: PoolClient | null = null;

    try {
      const pool = initializeOldSupabasePool();
      client = await pool.connect();

      // Query sentences with audio URLs - note: this assumes en_audio_url_expires_at column exists
      // If not, you need to add it to the sentences table in old project first
      const sentencesQuery = `
          SELECT en, en_audio_url, topic
          FROM sentences 
          WHERE en_audio_url IS NOT NULL 
            AND en_audio_url != ''
            AND (en_audio_url_expires_at IS NULL 
                 OR en_audio_url_expires_at < NOW() + interval '7 day')
          ORDER BY en_audio_url_expires_at ASC NULLS FIRST
          LIMIT 2000;
      `;
      const { rows: sentences } = await client.query(sentencesQuery);

      if (sentences.length === 0) {
        logger.info("No sentences URLs to refresh. Job finished.");
        return;
      }

      logger.info(`Found ${sentences.length} sentences to refresh.`);

      const storage = admin.storage();
      const learningBucket = storage.bucket(learningBucketNameParam.value());
      const deepReadBucket = storage.bucket(deepReadBucketNameParam.value());
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      // Update sentences
      for (const sentence of sentences) {
        const currentUrl: string = sentence.en_audio_url;
        const en: string = sentence.en;
        const topic: string = sentence.topic;

        if (!currentUrl) {
          continue;
        }

        const storagePath = extractStoragePath(currentUrl);

        if (!storagePath) {
          logger.warn(
            `Skipping sentence with en "${en}" - could not extract storage path from URL.`
          );
          continue;
        }

        // Choose bucket based on topic: 'chunk' means audio is in new project (deepRead), others in old project (learning)
        const bucket = topic === "chunk" ? deepReadBucket : learningBucket;

        logger.info(
          `Attempting to find file at path: "${storagePath}" in bucket: "${bucket.name}"`
        );
        const file = bucket.file(storagePath);

        const [newUrl] = await file.getSignedUrl({
          action: "read",
          expires: oneMonthFromNow,
        });

        await client.query(
          "UPDATE sentences SET en_audio_url = $1, en_audio_url_expires_at = $2 WHERE en = $3",
          [newUrl, oneMonthFromNow.toISOString(), en]
        );

        logger.info(
          `Updated sentence "${en}" with new signed URL (topic: ${topic}).`
        );
      }

      logger.info(
        `Successfully refreshed ${sentences.length} sentences signed URLs. Job finished.`
      );
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: "refreshSentencesSignedUrls" },
      });
      throw error;
    } finally {
      client?.release();
    }
  }
);
