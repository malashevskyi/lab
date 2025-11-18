import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { StackIdProperty } from '../decorators/stack-fields.decorators';
import { stackTypeSchema } from '@lab/types/assistant/stack';

export class CreateStackDto extends createZodDto(stackTypeSchema) {
  @StackIdProperty()
  id: z.infer<typeof stackTypeSchema.shape.id>;
}
