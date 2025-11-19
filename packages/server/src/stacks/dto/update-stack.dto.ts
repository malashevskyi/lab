import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { stackTypeSchema } from '@lab/types/assistant/stack/index.js';
import { StackIdProperty } from '../decorators/stack-fields.decorators';

export class UpdateStackDto extends createZodDto(stackTypeSchema) {
  @StackIdProperty()
  id: z.infer<typeof stackTypeSchema.shape.id>;
}
