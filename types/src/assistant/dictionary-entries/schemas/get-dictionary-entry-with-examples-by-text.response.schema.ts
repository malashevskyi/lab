import z from 'zod';
import { dictionaryEntryTypeSchema } from './dictionary-entry.schema.js';
import { getDictionaryExampleResponseTypeSchema } from '../../dictionary-examples/index.js';

export const getDictionaryEntryWithExamplesByTextResponseSchema =
  dictionaryEntryTypeSchema
    .pick({
      id: true,
      text: true,
      transcription: true,
      pronounceVideoLinks: true,
    })
    .extend({
      translation: z.string(),
      audioRecords: z.array(z.url()),
      examples: z.array(getDictionaryExampleResponseTypeSchema),
    })
    .strict();

export type GetDictionaryEntryWithExamplesByTextResponseType = z.infer<
  typeof getDictionaryEntryWithExamplesByTextResponseSchema
>;
