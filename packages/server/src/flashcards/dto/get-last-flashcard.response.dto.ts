import { getLastFlashcardResponseSchema } from '@lab/types/assistant/flashcards/index.js';
import { createZodDto } from 'nestjs-zod';
import {
  AnswerProperty,
  ContextProperty,
  ContextsProperty,
  CreatedAtProperty,
  IdProperty,
  LastIntervalProperty,
  LevelProperty,
  NextReviewDateProperty,
  QuestionAudioUrlProperty,
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

  @NextReviewDateProperty()
  nextReviewDate: z.infer<
    typeof getLastFlashcardResponseSchema.shape.nextReviewDate
  >;

  @LastIntervalProperty()
  lastInterval: z.infer<
    typeof getLastFlashcardResponseSchema.shape.lastInterval
  >;

  @QuestionAudioUrlProperty()
  questionAudioUrl: z.infer<
    typeof getLastFlashcardResponseSchema.shape.questionAudioUrl
  >;

  @CreatedAtProperty()
  createdAt: z.infer<typeof getLastFlashcardResponseSchema.shape.createdAt>;

  @UpdatedAtProperty()
  updatedAt: z.infer<typeof getLastFlashcardResponseSchema.shape.updatedAt>;
}
