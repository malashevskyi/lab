import z from 'zod';
import { dictionaryEntryTypeSchema } from './dictionary-entry.schema.js';

export const findOrCreateDictionaryEntryResponseSchema =
  dictionaryEntryTypeSchema
    .pick({
      id: true,
      text: true,
      transcription: true,
      pronounceVideoLinks: true,
      createdAt: true,
      updatedAt: true,
    })
    .extend({
      audioRecords: z.array(z.url()),
    });

export type FindOrCreateDictionaryEntryResponseType = z.infer<
  typeof findOrCreateDictionaryEntryResponseSchema
>;
