import { z } from 'zod';
import { flashcardTypeSchema } from './flashcard.schema.js';

export const createFlashcardResponseSchema = flashcardTypeSchema.pick({
  id: true,
});

export type CreateFlashcardResponseType = z.infer<
  typeof createFlashcardResponseSchema
>;
