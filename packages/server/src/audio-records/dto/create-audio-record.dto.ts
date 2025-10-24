import { createAudioRecordSchema } from '@lap/types/deep-read/audio-records/index.js';
import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

export class CreateAudioRecordDto extends createZodDto(
  createAudioRecordSchema,
) {
  @ApiProperty({
    example: 'Computer Science',
    description:
      'The unique identifier for the audio record, typically the selected text.',
  })
  id: string;

  @ApiProperty({
    example:
      'https://storage.googleapis.com/bucket-name/audio/computer_science.mp3',
    description: 'The public URL to the generated audio file.',
  })
  audioUrl: string;

  @ApiProperty({
    example: 'audio/computer_science.mp3',
    description:
      'The path to the audio file in the storage bucket, used for deletion.',
  })
  storagePath: string;

  @ApiProperty({
    example: 'https://example.com/audio.mp3',
    description: 'The public URL where the audio file will expire.',
  })
  audioUrlExpiresAt: string;

  @ApiProperty({
    example: '234e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the associated dictionary entry, if any.',
  })
  dictionaryEntryId: string | null;
}
