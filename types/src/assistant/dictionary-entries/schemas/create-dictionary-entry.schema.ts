import { dictionaryEntryTypeSchema } from './dictionary-entry.schema.js';

export const createDictionaryEntrySchema = dictionaryEntryTypeSchema.pick({
  text: true,
  transcription: true,
});
