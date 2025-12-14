import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
export const GetFlashcardGroupUrlsDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get flashcard group URLs',
      description:
        'Retrieves all URLs used to group flashcards (one per row in flashcard_group_urls table).',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Flashcard group URLs were successfully retrieved.',
      schema: {
        type: 'array',
        items: { type: 'string' },
      },
    }),
  );
};
