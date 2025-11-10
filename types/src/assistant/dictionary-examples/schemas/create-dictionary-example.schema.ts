import z from 'zod';
import { dictionaryExampleTypeSchema } from './dictionary-example.schema.js';

export const createDictionaryExampleSchema = dictionaryExampleTypeSchema.pick({
  example: true,
  translation: true,
  accent: true,
  accentTranslation: true,
  accentTranscription: true,
  dictionaryEntryId: true,
});

export type CreateDictionaryExample = z.infer<
  typeof createDictionaryExampleSchema
>;
