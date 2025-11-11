import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FlashcardEntity } from '../entities/flashcard.entity';

export function GetFlashcardsByUrlDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all flashcards for a specific source URL',
      description:
        'Returns all flashcards associated with the provided source URL',
    }),
    ApiParam({
      name: 'sourceUrl',
      description: 'The source URL to filter flashcards by',
      type: String,
      required: true,
    }),
    ApiOkResponse({
      description: 'List of flashcards for the given source URL',
      type: [FlashcardEntity],
    }),
    ApiBadRequestResponse({
      description: 'Invalid source URL provided',
    }),
  );
}
