import z from 'zod';
import { createZodDto } from 'nestjs-zod';
import {
  TextProperty,
  TranscriptionProperty,
} from '../decorators/dictionary-entry-fields.decorators.js';
import { createDictionaryEntrySchema } from '@lab/types/deep-read/dictionary-entries/index.js';

export class CreateDictionaryEntryDto extends createZodDto(
  createDictionaryEntrySchema,
) {
  @TextProperty()
  text: z.infer<typeof createDictionaryEntrySchema.shape.text>;

  @TranscriptionProperty()
  transcription: z.infer<
    typeof createDictionaryEntrySchema.shape.transcription
  >;
}
