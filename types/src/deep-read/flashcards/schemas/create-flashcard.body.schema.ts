import { z } from 'zod';
import { flashcardTypeSchema } from './flashcard.schema.js';

export const createFlashcardBodySchema = flashcardTypeSchema
  .pick({ sourceUrl: true })
  .extend({
    title: z.string().min(1, 'Title cannot be empty.'),
    chunks: z
      .array(z.string().min(1, 'Chunk cannot be empty.'))
      .min(1, 'At least one chunk is required.'),
  });

export type CreateFlashcardBodyType = z.infer<typeof createFlashcardBodySchema>;
