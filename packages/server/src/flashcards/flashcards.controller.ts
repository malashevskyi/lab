import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { GetLastFlashcardDocs } from './decorators/get-last-flashcard.docs.decorator';
import { GetFlashcardsByUrlDocs } from './decorators/get-flashcards-by-url.docs.decorator';
import { FlashcardEntity } from './entities/flashcard.entity';
import { CreateFlashcardResponseType } from '@lab/types/assistant/flashcards/index.js';

@ApiTags('Flashcards')
@UsePipes(ZodValidationPipe)
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  async createFlashcard(
    @Body() createDto: CreateFlashcardDto,
  ): Promise<CreateFlashcardResponseType> {
    return this.flashcardsService.createFlashcard(createDto);
  }

  @Get('last')
  @GetLastFlashcardDocs()
  async getLastFlashcard(): Promise<FlashcardEntity | null> {
    return this.flashcardsService.findLast();
  }

  @Get('by-url/:sourceUrl')
  @GetFlashcardsByUrlDocs()
  async getFlashcardsByUrl(
    @Param('sourceUrl') sourceUrl: string,
  ): Promise<FlashcardEntity[]> {
    return this.flashcardsService.findBySourceUrl(sourceUrl);
  }

  @Put(':id')
  async updateFlashcard(
    @Param('id') id: string,
    @Body() updateDto: UpdateFlashcardDto,
  ): Promise<FlashcardEntity | null> {
    return this.flashcardsService.updateFlashcard(id, updateDto);
  }
}
