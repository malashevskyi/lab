import { createZodDto } from 'nestjs-zod';
import {
  AccentProperty,
  AccentTranscriptionProperty,
  AccentTranslationProperty,
  DictionaryEntryIdProperty,
  ExampleProperty,
  TranslationProperty,
} from '../decorators/dictionary-example-fields.decorators.js';
import { createDictionaryExampleSchema } from '@lap/types/deep-read/dictionary-examples/index.js';
import z from 'zod';

export class CreateDictionaryExampleDto extends createZodDto(
  createDictionaryExampleSchema,
) {
  @ExampleProperty()
  example: z.infer<typeof createDictionaryExampleSchema.shape.example>;

  @TranslationProperty()
  translation: z.infer<typeof createDictionaryExampleSchema.shape.translation>;

  @AccentProperty()
  accent: z.infer<typeof createDictionaryExampleSchema.shape.accent>;

  @AccentTranslationProperty()
  accentTranslation: z.infer<
    typeof createDictionaryExampleSchema.shape.accentTranslation
  >;

  @AccentTranscriptionProperty()
  accentTranscription: z.infer<
    typeof createDictionaryExampleSchema.shape.accentTranscription
  >;

  @DictionaryEntryIdProperty()
  dictionaryEntryId: z.infer<
    typeof createDictionaryExampleSchema.shape.dictionaryEntryId
  >;
}
