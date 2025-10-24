import { createZodDto } from 'nestjs-zod';
import {
  AudioRecordsProperty,
  PronounceVideoLinksProperty,
  TextProperty,
  TranscriptionProperty,
} from '../decorators/dictionary-entry-fields.decorators.js';
import z from 'zod';
import { findOrCreateDictionaryEntryResponseSchema } from '@lap/types/deep-read/dictionary-entries/index.js';

export class FindOrCreateDictionaryEntryResponseDto extends createZodDto(
  findOrCreateDictionaryEntryResponseSchema,
) {
  @TextProperty()
  text: z.infer<typeof findOrCreateDictionaryEntryResponseSchema.shape.text>;

  @TranscriptionProperty()
  transcription: z.infer<
    typeof findOrCreateDictionaryEntryResponseSchema.shape.transcription
  >;

  @AudioRecordsProperty()
  audioRecords: z.infer<
    typeof findOrCreateDictionaryEntryResponseSchema.shape.audioRecords
  >;

  @PronounceVideoLinksProperty()
  pronounceVideoLinks: z.infer<
    typeof findOrCreateDictionaryEntryResponseSchema.shape.pronounceVideoLinks
  >;
}
