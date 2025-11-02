import { z } from 'zod';
import { flashcardTypeSchema } from './flashcard.schema.js';

export const getLastFlashcardResponseSchema = flashcardTypeSchema;

export type GetLastFlashcardResponseType = z.infer<
  typeof getLastFlashcardResponseSchema
>;
