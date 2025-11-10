import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import {
  AudioRecordsProperty,
  ExamplesProperty,
  PronounceVideoLinksProperty,
  TextProperty,
  TranscriptionProperty,
  TranslationProperty,
} from '../decorators/dictionary-entry-fields.decorators.js';
import { getDictionaryEntryWithExamplesByTextResponseSchema } from '@lab/types/assistant/dictionary-entries/index.js';

export class GetEntryWithExamplesByTextResponseDto extends createZodDto(
  getDictionaryEntryWithExamplesByTextResponseSchema,
) {
  @TextProperty()
  text: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.text
  >;

  @TranscriptionProperty()
  transcription: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.transcription
  >;

  @PronounceVideoLinksProperty()
  pronounceVideoLinks: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.pronounceVideoLinks
  >;

  @ExamplesProperty()
  examples: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.examples
  >;

  @TranslationProperty()
  translation: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.translation
  >;

  @AudioRecordsProperty()
  audioRecords: z.infer<
    typeof getDictionaryEntryWithExamplesByTextResponseSchema.shape.audioRecords
  >;
}
