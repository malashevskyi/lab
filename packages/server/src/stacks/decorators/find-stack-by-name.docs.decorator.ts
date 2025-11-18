import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StackEntity } from '../entities/stack.entity';

export const FindStackByNameDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Find stack by name (case-insensitive)',
      description:
        'Searches for a stack using case-insensitive comparison. The search uses ILIKE and requires exact length match.',
    }),
    ApiParam({
      name: 'name',
      description: 'Stack name to search for (e.g., React, node.js)',
      example: 'React',
      type: String,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Stack found and returned.',
      type: StackEntity,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Stack not found.',
    }),
  );
};
