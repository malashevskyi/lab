import z from 'zod';
import { flashcardTypeSchema } from '../../flashcards';

export const generateFlashcardResponseSchema = flashcardTypeSchema.pick({
  question: true,
  answer: true,
  tags: true,
  level: true,
  contexts: true,
});

export type GenerateFlashcardResponse = z.infer<
  typeof generateFlashcardResponseSchema
>;
