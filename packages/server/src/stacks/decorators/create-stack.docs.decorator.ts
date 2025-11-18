import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateStackDto } from '../dto/create-stack.dto';
import { StackEntity } from '../entities/stack.entity';

export const CreateStackDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new stack or return existing one',
      description:
        'Creates a new stack with the provided ID. If a stack with the same ID already exists (case-insensitive), returns the existing stack.',
    }),
    ApiBody({
      type: CreateStackDto,
      description: 'Stack data with unique ID',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Stack successfully created or existing stack returned.',
      type: StackEntity,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data.',
    }),
  );
};
