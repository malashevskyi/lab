import { createZodDto } from 'nestjs-zod';
import {
  ExampleProperty,
  TextProperty,
  TranscriptionProperty,
} from '../decorators/dictionary-entry-fields.decorators.js';
import { createDictionaryEntryWithExampleBodySchema } from '@lap/types/deep-read/dictionary-entries/index.js';
import z from 'zod';

export class CreateEntryWithExampleDto extends createZodDto(
  createDictionaryEntryWithExampleBodySchema,
) {
  @TextProperty()
  text: z.infer<typeof createDictionaryEntryWithExampleBodySchema.shape.text>;

  @TranscriptionProperty()
  transcription: z.infer<
    typeof createDictionaryEntryWithExampleBodySchema.shape.transcription
  >;

  @ExampleProperty()
  example: z.infer<
    typeof createDictionaryEntryWithExampleBodySchema.shape.example
  >;
}
