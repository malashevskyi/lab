import { flashcardTypeSchema } from '@lab/types/deep-read/flashcards';
import { z } from 'zod';

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

export abstract class AiFlashcardGeneratorPort {
  abstract generateFlashcardFromChunks(
    title: string,
    chunks: string[],
  ): Promise<GenerateFlashcardResponse>;
}
