import { createFlashcardBodySchema } from '@lab/types/deep-read/flashcards';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  ChunksProperty,
  SourceUrlProperty,
  TitleProperty,
} from '../decorators/flashcards-fields.decorators';

export class CreateFlashcardDto extends createZodDto(
  createFlashcardBodySchema,
) {
  @TitleProperty()
  title: z.infer<typeof createFlashcardBodySchema.shape.title>;

  @ChunksProperty()
  chunks: z.infer<typeof createFlashcardBodySchema.shape.chunks>;

  @SourceUrlProperty()
  sourceUrl: z.infer<typeof createFlashcardBodySchema.shape.sourceUrl>;
}
