import { getLastFlashcardResponseSchema } from '@lab/types/deep-read/flashcards/index.js';
import { createZodDto } from 'nestjs-zod';
import {
  AnswerProperty,
  ContextProperty,
  ContextsProperty,
  CreatedAtProperty,
  IdProperty,
  LevelProperty,
  QuestionProperty,
  SourceUrlProperty,
  TagsProperty,
  UpdatedAtProperty,
} from '../decorators/flashcards-fields.decorators';
import z from 'zod';

export class GetLastFlashcardResponseDto extends createZodDto(
  getLastFlashcardResponseSchema,
) {
  @IdProperty()
  id: z.infer<typeof getLastFlashcardResponseSchema.shape.id>;

  @QuestionProperty()
  question: z.infer<typeof getLastFlashcardResponseSchema.shape.question>;

  @AnswerProperty()
  answer: z.infer<typeof getLastFlashcardResponseSchema.shape.answer>;

  @ContextProperty()
  context: z.infer<typeof getLastFlashcardResponseSchema.shape.context>;

  @SourceUrlProperty()
  sourceUrl: z.infer<typeof getLastFlashcardResponseSchema.shape.sourceUrl>;

  @TagsProperty()
  tags: z.infer<typeof getLastFlashcardResponseSchema.shape.tags>;

  @LevelProperty()
  level: z.infer<typeof getLastFlashcardResponseSchema.shape.level>;

  @ContextsProperty()
  contexts: z.infer<typeof getLastFlashcardResponseSchema.shape.contexts>;

  @CreatedAtProperty()
  createdAt: z.infer<typeof getLastFlashcardResponseSchema.shape.createdAt>;

  @UpdatedAtProperty()
  updatedAt: z.infer<typeof getLastFlashcardResponseSchema.shape.updatedAt>;
}
