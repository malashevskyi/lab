import { createChunksBodyTypeSchema } from '@lab/types/assistant/chunks/index.js';
import { createZodDto } from 'nestjs-zod';

export class CreateChunksDto extends createZodDto(createChunksBodyTypeSchema) {}
