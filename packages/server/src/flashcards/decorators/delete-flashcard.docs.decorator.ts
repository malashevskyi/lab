import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

export const DeleteFlashcardDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete a flashcard',
      description:
        'Deletes a flashcard by ID and removes associated audio from Firebase Storage if it exists.',
    }),
    ApiParam({
      name: 'id',
      description: 'The unique identifier of the flashcard to delete',
      type: String,
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiNoContentResponse({
      description: 'Flashcard deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'Flashcard not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid flashcard ID format',
    }),
  );
};
