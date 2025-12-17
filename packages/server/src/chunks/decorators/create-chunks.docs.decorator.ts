import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const CreateChunksDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create multiple chunks',
      description:
        'Saves multiple text chunks to the database for future analysis and tracking.',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The chunks have been successfully created.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data.',
    }),
  );
};
