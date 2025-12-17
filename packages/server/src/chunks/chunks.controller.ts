import {
  Body,
  Controller,
  Post,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { ChunksService } from './chunks.service';
import { CreateChunksDto } from './dto/create-chunks.dto';

@ApiTags('Chunks')
@UsePipes(ZodValidationPipe)
@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple chunks' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The chunks have been successfully created.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  async createChunks(@Body() createChunksDto: CreateChunksDto): Promise<void> {
    return this.chunksService.createMany(createChunksDto);
  }
}
