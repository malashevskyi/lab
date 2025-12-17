import {
  Body,
  Controller,
  Post,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ChunksService } from './chunks.service';
import { CreateChunksDto } from './dto/create-chunks.dto';
import { CreateChunksDocs } from './decorators/create-chunks.docs.decorator';

@ApiTags('Chunks')
@UsePipes(ZodValidationPipe)
@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateChunksDocs()
  async createChunks(@Body() createChunksDto: CreateChunksDto): Promise<void> {
    return this.chunksService.createMany(createChunksDto);
  }
}
