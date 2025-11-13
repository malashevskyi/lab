import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

export const GetTodayCountDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get count of flashcards created today',
      description:
        'Returns the number of flashcards created today (from midnight to current time).',
    }),
    ApiOkResponse({
      description: 'Count of flashcards created today',
      schema: {
        type: 'object',
        properties: {
          count: {
            type: 'number',
            example: 5,
            description: 'Number of flashcards created today',
          },
        },
      },
    }),
  );
};
