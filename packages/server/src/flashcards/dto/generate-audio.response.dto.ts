import { flashcardTypeSchema } from '@lab/types/assistant/flashcards/index.js';
import z from 'zod';
import { QuestionAudioUrlProperty } from '../decorators/flashcards-fields.decorators';

export class GenerateAudioResponseDto {
  @QuestionAudioUrlProperty()
  audioUrl: z.infer<typeof flashcardTypeSchema.shape.questionAudioUrl>;
}
