import { createFlashcardBodySchema } from '@lab/types/assistant/flashcards/index.js';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  ChunksProperty,
  IdProperty,
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

  @IdProperty()
  id?: z.infer<typeof createFlashcardBodySchema.shape.id>;
}
