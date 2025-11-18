import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export function StackIdProperty() {
  return applyDecorators(
    ApiProperty({
      description:
        'The unique identifier for the stack (e.g., technology or context name).',
      example: 'React',
      maxLength: 100,
    }),
    IsString(),
    IsNotEmpty(),
    MaxLength(100),
  );
}
