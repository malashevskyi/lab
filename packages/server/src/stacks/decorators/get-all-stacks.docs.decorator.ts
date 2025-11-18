import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StackEntity } from '../entities/stack.entity';

export const GetAllStacksDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all stacks',
      description:
        'Retrieves all stacks from the database sorted alphabetically by ID.',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'All stacks were successfully retrieved.',
      type: [StackEntity],
    }),
  );
};
