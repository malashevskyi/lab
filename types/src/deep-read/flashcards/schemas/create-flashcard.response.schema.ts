import { z } from 'zod';
import { flashcardTypeSchema } from './flashcard.schema';

export const createFlashcardResponseSchema = flashcardTypeSchema;

export type CreateFlashcardResponseType = z.infer<
  typeof createFlashcardResponseSchema
>;
