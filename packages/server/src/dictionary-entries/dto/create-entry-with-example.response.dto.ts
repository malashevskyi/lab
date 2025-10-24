import { createZodDto } from 'nestjs-zod';
import { TextProperty } from '../decorators/dictionary-entry-fields.decorators.js';
import z from 'zod';
import { createDictionaryEntryWithExampleResponseSchema } from '@lap/types/deep-read/dictionary-entries/index.js';

export class CreateEntryWithExampleResponseDto extends createZodDto(
  createDictionaryEntryWithExampleResponseSchema,
) {
  @TextProperty()
  text: z.infer<
    typeof createDictionaryEntryWithExampleResponseSchema.shape.text
  >;
}
