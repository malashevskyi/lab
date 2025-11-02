import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetLastFlashcardResponseDto } from '../dto/get-last-flashcard.response.dto';

export const GetLastFlashcardDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get the last created flashcard',
      description:
        'Retrieves the most recently created flashcard from the database.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The last flashcard was successfully retrieved.',
      type: GetLastFlashcardResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'No flashcards were found in the database.',
    }),
  );
};
