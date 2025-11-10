import z from 'zod';

export const analysisResponseSchema = z.object({
  word: z.object({
    text: z.string(),
    transcription: z.string(),
    translation: z.string(),
  }),
  example: z.object({
    adaptedSentence: z.string(),
    translation: z.string(),
  }),
});

export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
