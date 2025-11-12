import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GenerateAudioResponseDto } from '../dto/generate-audio.response.dto';

export const GenerateFlashcardQuestionAudioDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Generate audio for flashcard question',
      description:
        'Generates Text-to-Speech audio for the question of a specific flashcard and uploads it to Firebase Storage in the flashcard-questions folder. If audio already exists, it will be replaced.',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'The unique identifier (UUID) of the flashcard',
      example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Audio generated successfully and flashcard updated.',
      type: GenerateAudioResponseDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Flashcard with the specified ID was not found.',
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Failed to generate or upload audio.',
    }),
  );
};
