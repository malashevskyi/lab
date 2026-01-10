import { z } from 'zod';

export const AdjustedChunkResultSchema = z.object({
  adjustedText: z.string(),
  translation: z.string(),
});

export type AdjustedChunkResult = z.infer<typeof AdjustedChunkResultSchema>;

export abstract class AiChunkProcessorPort {
  /**
   * Adjust a chunk by adding capitalization, punctuation, or minimal grammar fixes
   * to make it a standalone sentence without changing core words or meaning.
   * Also translate the adjusted chunk to Ukrainian.
   * @param chunk - raw text copied from page
   * @param lang - language code (default 'en')
   * @returns object with adjusted text and Ukrainian translation
   */
  abstract processChunk(
    chunk: string,
    lang?: string,
  ): Promise<AdjustedChunkResult>;
}
