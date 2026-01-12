import * as Sentry from "@sentry/node";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions/v2";
import { Pool, type PoolClient } from "pg";
import { initializeSentry } from "../bootstrap.js";

const newSupabaseUrlParam = defineSecret("SUPABASE_DATABASE_URL");
const oldSupabaseUrlParam = defineSecret("OLD_SUPABASE_DATABASE_URL");

let newSupabasePool: Pool;
let oldSupabasePool: Pool;

const initializeNewSupabasePool = (): Pool => {
  try {
    if (!newSupabasePool) {
      const connectionString = newSupabaseUrlParam.value();
      if (!connectionString) {
        throw new Error(
          "SUPABASE_DATABASE_URL parameter is not available at runtime."
        );
      }
      newSupabasePool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
    }
    return newSupabasePool;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { function: "initializeNewSupabasePool" },
    });
    throw error;
  }
};

const initializeOldSupabasePool = (): Pool => {
  try {
    if (!oldSupabasePool) {
      const connectionString = oldSupabaseUrlParam.value();
      if (!connectionString) {
        throw new Error(
          "OLD_SUPABASE_DATABASE_URL parameter is not available at runtime."
        );
      }
      logger.info("Initializing old Supabase pool connection...");
      oldSupabasePool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });
      logger.info("Old Supabase pool initialized successfully");
    }
    return oldSupabasePool;
  } catch (error) {
    if (error instanceof Error) {
      logger.info(`Failed to initialize old Supabase pool: ${error.message}`);
    }
    Sentry.captureException(error, {
      tags: { function: "initializeOldSupabasePool" },
    });
    throw error;
  }
};

interface ChunkRow {
  id: string;
  text: string;
  lang: string;
  uk: string | null;
  chunk_audio: string | null;
  chunk_audio_expires_at: string | null;
}

export default onSchedule(
  {
    schedule: "every 10 minutes",
    region: "europe-west1",
    timeoutSeconds: 540,
    secrets: [newSupabaseUrlParam, oldSupabaseUrlParam],
  },
  async () => {
    initializeSentry();
    logger.info("Starting job: syncChunksToOldProject");
    let newClient: PoolClient | null = null;
    let oldClient: PoolClient | null = null;

    try {
      logger.info("Initializing database connections...");

      // Initialize new Supabase pool (PostgreSQL direct connection)
      const newPool = initializeNewSupabasePool();
      logger.info("New pool:", newPool);
      newClient = await newPool.connect();
      logger.info("Connected to new Supabase database");

      // Initialize old Supabase pool (PostgreSQL direct connection)
      logger.info("Attempting to connect to old Supabase database...");
      const oldPool = initializeOldSupabasePool();

      try {
        oldClient = await oldPool.connect();
        logger.info("Connected to old Supabase database");
      } catch (connectionError) {
        if (connectionError instanceof Error) {
          logger.info(
            `Failed to connect to old database: ${connectionError.message}`
          );
        }
        throw connectionError;
      }

      // Query unsynced chunks (limit 50)
      const chunksQuery = `
        SELECT id, text, lang, uk, chunk_audio
        FROM chunks
        WHERE synced = false
          AND uk IS NOT NULL
        LIMIT 50;
      `;

      const { rows: chunks } = await newClient.query<ChunkRow>(chunksQuery);

      if (chunks.length === 0) {
        logger.info("No unsynced chunks found. Job finished.");
        return;
      }

      logger.info(`Found ${chunks.length} chunks to sync.`);

      for (const chunk of chunks) {
        try {
          // Only sync English chunks (as per requirement)
          if (chunk.lang !== "en") {
            logger.warn(
              `Skipping chunk ${chunk.id} - lang is ${chunk.lang}, not 'en'`
            );
            continue;
          }

          if (!chunk.uk) {
            logger.warn(
              `Skipping chunk ${chunk.id} - missing Ukrainian translation`
            );
            continue;
          }

          const sentenceData = {
            en: chunk.text,
            ua: chunk.uk,
            new_word: null,
            en_audio_url: chunk.chunk_audio,
            en_audio_url_expires_at: chunk.chunk_audio_expires_at,
            ua_audio_url: null,
            meaning: null,
            answers: null,
            clip_id: null,
            is_question: null,
            video_id: null,
            verified_words: null,
            verified_translation: null,
            topic: "chunk",
            topic_page: null,
            audio_update: null,
          };

          // Insert into old Supabase sentences table using direct SQL
          const insertQuery = `
            INSERT INTO sentences (
              en, ua, new_word, en_audio_url, en_audio_url_expires_at, ua_audio_url, meaning, answers,
              clip_id, is_question, video_id, verified_words, verified_translation,
              topic, topic_page, audio_update
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            ON CONFLICT (en) DO NOTHING;
          `;

          const insertValues = [
            sentenceData.en,
            sentenceData.ua,
            sentenceData.new_word,
            sentenceData.en_audio_url,
            sentenceData.en_audio_url_expires_at,
            sentenceData.ua_audio_url,
            sentenceData.meaning,
            sentenceData.answers,
            sentenceData.clip_id,
            sentenceData.is_question,
            sentenceData.video_id,
            sentenceData.verified_words,
            sentenceData.verified_translation,
            sentenceData.topic,
            sentenceData.topic_page,
            sentenceData.audio_update,
          ];

          const result = await oldClient.query(insertQuery, insertValues);

          if (result.rowCount === 0) {
            logger.info(
              `Chunk ${chunk.id} already exists in old project (duplicate), marking as synced`
            );
          }

          // Mark as synced in new database
          await newClient.query(
            "UPDATE chunks SET synced = true WHERE id = $1",
            [chunk.id]
          );

          logger.info(`Successfully synced chunk ${chunk.id}`);
        } catch (error) {
          if (
            error instanceof Error &&
            (error as { code?: string }).code !== "23505"
          ) {
            logger.info(`Error syncing chunk ${chunk.id}: ${error.message}`);
            Sentry.captureException(error, {
              tags: { function: "syncChunksToOldProject", chunkId: chunk.id },
            });
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.info(`Error syncing chunks to old project: ${error.message}`);
      }
      Sentry.captureException(error, {
        tags: { function: "syncChunksToOldProject" },
      });
      throw error;
    } finally {
      newClient?.release();
      oldClient?.release();
    }
  }
);
