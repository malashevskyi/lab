import { z } from 'zod';
import { audioRecordTypeSchema } from './audio-record.schema.js';

export const createAudioRecordSchema = audioRecordTypeSchema
  .pick({
    id: true,
    audioUrl: true,
    storagePath: true,
    dictionaryEntryId: true,
  })
  .extend({
    audioUrlExpiresAt: z.url(),
  });
