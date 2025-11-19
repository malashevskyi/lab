import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import {
  AnswerProperty,
  ContextProperty,
  QuestionProperty,
} from '../decorators/flashcards-fields.decorators';
import { updateFlashcardBodySchema } from '@lab/types/assistant/flashcards';

export class UpdateFlashcardDto extends createZodDto(
  updateFlashcardBodySchema,
) {
  @QuestionProperty()
  question?: z.infer<typeof updateFlashcardBodySchema.shape.question>;

  @AnswerProperty()
  answer?: z.infer<typeof updateFlashcardBodySchema.shape.answer>;

  @ContextProperty()
  context?: z.infer<typeof updateFlashcardBodySchema.shape.context>;
}
