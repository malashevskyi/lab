import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateStackDto } from '../dto/update-stack.dto';
import { StackEntity } from '../entities/stack.entity';

export const UpdateStackDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Update stack ID',
      description:
        'Updates the stack ID (renames the stack). All flashcards using the old stack will be updated to use the new stack ID.',
    }),
    ApiParam({
      name: 'oldId',
      description: 'Current stack ID to update',
      example: 'react',
      type: String,
    }),
    ApiBody({
      type: UpdateStackDto,
      description: 'New stack ID',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Stack successfully updated.',
      type: StackEntity,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Stack with the old ID not found.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data.',
    }),
  );
};
