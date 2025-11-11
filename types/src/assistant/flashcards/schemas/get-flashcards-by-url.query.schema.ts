import { z } from 'zod';

export const getFlashcardsByUrlQuerySchema = z.object({
  sourceUrl: z.url(),
});
