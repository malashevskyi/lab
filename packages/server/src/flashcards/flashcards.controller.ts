import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UsePipes,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { GetLastFlashcardDocs } from './decorators/get-last-flashcard.docs.decorator';
import { GetFlashcardsByUrlDocs } from './decorators/get-flashcards-by-url.docs.decorator';
import { GenerateFlashcardQuestionAudioDocs } from './decorators/generate-flashcard-question-audio.docs.decorator';
import { DeleteFlashcardDocs } from './decorators/delete-flashcard.docs.decorator';
import { GetTodayCountDocs } from './decorators/get-today-count.docs.decorator';
import { GetFlashcardGroupUrlsDocs } from './decorators/get-flashcard-group-urls.docs.decorator';
import { FlashcardEntity } from './entities/flashcard.entity';
import { CreateFlashcardResponseType } from '@lab/types/assistant/flashcards/index.js';
import { GenerateAudioResponseDto } from './dto/generate-audio.response.dto';

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

  @Get('today/count')
  @GetTodayCountDocs()
  async getTodayCount(): Promise<{ count: number }> {
    const count = await this.flashcardsService.countTodayFlashcards();
    return { count };
  }

  @Get('group-urls')
  @GetFlashcardGroupUrlsDocs()
  async getFlashcardGroupURLs(): Promise<string[]> {
    return this.flashcardsService.getFlashcardGroupURLs();
  }

  @Put(':id')
  async updateFlashcard(
    @Param('id') id: string,
    @Body() updateDto: UpdateFlashcardDto,
  ): Promise<FlashcardEntity | null> {
    return this.flashcardsService.updateFlashcard(id, updateDto);
  }

  @Post(':id/generate-question-audio')
  @GenerateFlashcardQuestionAudioDocs()
  async generateQuestionAudio(
    @Param('id') id: string,
  ): Promise<GenerateAudioResponseDto> {
    return this.flashcardsService.generateQuestionAudio(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @DeleteFlashcardDocs()
  async deleteFlashcard(@Param('id') id: string): Promise<void> {
    await this.flashcardsService.deleteFlashcard(id);
  }
}
