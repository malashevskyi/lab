import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateFlashcardDto {
  @ApiProperty({
    description: 'Chunks of text used to generate the flashcard question.',
    example: ['capital of France', 'largest city in France'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  chunks: string[];

  @ApiPropertyOptional({
    description: 'Source URL when the data were copied',
    example: 'https://example.com/geography/france',
  })
  @IsUrl()
  sourceUrl: string;
}
