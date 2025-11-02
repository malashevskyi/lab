import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsUrl,
} from 'class-validator';

export function TitleProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'Title of the article from which the flashcard is generated.',
      example: 'Geography of France',
    }),
    IsString(),
    IsNotEmpty(),
  );
}

export function ChunksProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'Chunks of text used to generate the flashcard question.',
      example: ['capital of France', 'largest city in France'],
    }),
    IsArray(),
    ArrayMinSize(1),
    IsString({ each: true }),
    IsNotEmpty({ each: true }),
  );
}

export function SourceUrlProperty() {
  return applyDecorators(
    ApiProperty({
      description: 'Source URL when the data were copied',
      example: 'https://example.com/geography/france',
    }),
    IsUrl(),
  );
}
