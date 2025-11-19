import { z } from 'zod';
import { flashcardTypeSchema } from './flashcard.schema.js';

export const updateFlashcardBodySchema = flashcardTypeSchema
  .pick({
    question: true,
    answer: true,
    context: true,
  })
  .partial();

export type UpdateFlashcardBodyType = z.infer<typeof updateFlashcardBodySchema>;
